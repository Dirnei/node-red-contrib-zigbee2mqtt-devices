
module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function otaUpdate(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var nodeContext = this.context();
        var isUpdating = nodeContext.get("isUpdating") || false;
        var currentDevice = nodeContext.get("currentDevice") || "";
        var currentDeviceState = nodeContext.get("currentDeviceState") || "";
        var updateableDevices = [];

        if (isUpdating === true) {
            node.status({ fill: "yellow", text: "Updating..." });
        } else {
            node.status({ fill: "green", text: "ready" });
        }

        if (!bridgeNode.registerOtaNode(node.id, otaStatusUpdateReceived, deviceStatusReceived)) {
            node.status({ fill: "red", text: "duplicate ota update" });
            node.error("Duplicate ota update node. Only one ota update node per bridge allowed!")
            return;
        }

        function otaStatusUpdateReceived(msg) {
            switch (msg.status) {
                case "available":
                    logVerbose("Update available for: " + msg.device);

                    var found = bridgeNode.getDeviceList().find(d => d.friendly_name == msg.device && d.type === "Router");
                    if (!found) {
                        logVerbose(`'${msg.device}' can not be updated. Auto update is only available for routers. Please update it manually`);
                        return;
                    }

                    addAvailableDevice(msg.device);

                    if (config.autoUpdate === true && isUpdating === false) {
                        startNext();
                    } else {
                        node.send({
                            payload: {
                                device: msg.device,
                                message: "Update available",
                            }
                        });
                    }
                    break;
                case "update_failed":
                    node.send({
                        payload: {
                            device: msg.device,
                            message: "Update failed",
                        }
                    });

                    cleanup();
                    setUpdateFlag(false);

                    node.error(msg);
                    break;
                case "update_progress":
                    setUpdateFlag(true);
                    logVerbose(msg.message);
                    setCurrentDevice(msg.device);
                    node.status({ fill: "yellow", text: `Updating... ${msg.progress}%` });
                    break;
                case "update_succeeded":
                    setUpdateFlag(false);

                    const index = updateableDevices.indexOf(msg.device);
                    if (index > -1) {
                        updateableDevices.splice(index, 1);
                        node.status({ fill: "blue", text: updateableDevices.length + " updates available" });
                    }
                    nodeContext.set("updates_available", updateableDevices);
                    cleanup();

                    if (updateableDevices.length > 0) {
                        node.status({ fill: "grey", text: "Next update will start in 5 Secons...." });
                        setTimeout(function () {
                            startNext();
                        }, 5000)
                    }

                    node.status({ fill: "green", text: "ready" });
                    node.send({
                        payload: {
                            device: msg.device,
                            message: "Update succeded",
                            nedUpdatedQueued: updateableDevices.length > 0
                        }
                    });
                    break;
            }
        }

        function cleanup() {
            bridgeNode.unsubscribe(node.id);
            bridgeNode.setDeviceState(currentDevice, currentDeviceState);
            setCurrentDeviceState(null);
            setCurrentDevice("");
        }

        function deviceStatusReceived(deviceName, msg) {
            if (deviceName !== currentDevice) {
                if (msg.update_available === true && updateableDevices.indexOf(deviceName) === -1) {
                    addAvailableDevice(deviceName);
                }

                return;
            }

            setCurrentDeviceState(msg);
        }

        function setCurrentDevice(device) {
            if (currentDevice !== device && device !== null) {
                bridgeNode.subscribeDevice(node.id, currentDevice, (msg) => {
                    deviceStatusReceived(currentDevice, msg)
                });

                bridgeNode.refreshDevice(device);
            }

            currentDevice = device;
            nodeContext.set("currentDevice", currentDevice);
        }

        function setCurrentDeviceState(state) {
            currentDeviceState = state;
            nodeContext.set("currentDeviceState", currentDeviceState);
        }

        function setUpdateFlag(state) {
            isUpdating = state;
            nodeContext.set("isUpdating", isUpdating);
        }

        function addAvailableDevice(device) {
            updateableDevices.push(device);
            if (isUpdating !== true) {
                node.status({ fill: "blue", text: updateableDevices.length + " updates available" });
            }
            nodeContext.set("updates_available", updateableDevices);
        }

        function startNext() {
            if (updateableDevices.length > 0) {
                startUpdate(updateableDevices[0])
            }
        }

        function startUpdate(device) {
            if (!device) {
                node.error("msg.device was not set");
                return;
            }

            var found = bridgeNode.getDeviceList().find(d => d.friendly_name == device);
            if (!found) {
                node.error("Device not found");
                return;
            }

            if (isUpdating === true) {
                if (updateableDevices.indexOf(device) === -1) {
                    addAvailableDevice(device);
                }

                return;
            }

            setUpdateFlag(true);
            setCurrentDevice(device);

            node.status({ fill: "yellow", text: "Updating..." });
            try {
                bridgeNode.publish(bridgeNode.baseTopic + "/bridge/ota_update/update", device);
                node.send({
                    payload: {
                        device: device,
                        message: "Update started"
                    }
                });
            } catch (err) {
                node.error(err);
            }
        }

        node.on('input', function (msg) {
            startUpdate(msg.payload.device);
        });

        node.on('close', function () {
            bridgeNode.unsubscribe(node.id);
        });

        function logVerbose(msg) {
            if (config.verboseLogging === true) {
                node.warn(msg);
            }
        }
    }
    RED.nodes.registerType("ota-update", otaUpdate);

    /*

    AVAILABLE:
    {"message":"Update available for 'Ikea Gang Mitte'","meta":{"device":"Ikea Gang Mitte","status":"available"},"type":"ota_update"}

    PROGRESS:
    {"message":"Update of 'Ikea Gang Mitte' at 100.00%","meta":{"device":"Ikea Gang Mitte","progress":100,"status":"update_progress"},"type":"ota_update"}

    FAILED:
    {"message":"Update of 'Ikea Gang Mitte' failed (Request failed with status code 434)","meta":{"device":"Ikea Gang Mitte","status":"update_failed"},"type":"ota_update"}

    FINISHED:
    {"message":"Ikea Gang Mitte","meta":{"device":"Ikea Gang Mitte","from":{"date_code":"20190407","software_build_id":"2.0.023"},"status":"update_succeeded","to":{"date_code":"20190407","software_build_id":"2.0.023"}},"type":"ota_update"}

    */

}