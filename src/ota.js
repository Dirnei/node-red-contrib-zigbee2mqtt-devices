
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
        var currentDeviceState = nodeContext.get("currentDeviceState") || {};
        var overrideAutoUpdate = false;
        var updateableDevices = [];

        if (!bridgeNode.registerOtaNode(node.id, otaStatusUpdateReceived, deviceStatusReceived)) {
            node.status({ fill: "red", text: "duplicate ota update" });
            node.error("Duplicate ota update node. Only one ota update node per bridge allowed!")
            return;
        }

        function otaStatusUpdateReceived(msg) {
            switch (msg.status) {
                case "available":

                    var found = bridgeNode.getDeviceList().find(d => d.friendly_name == msg.device && d.type === "Router");
                    if (!found) {
                        logVerbose(`'${msg.device}' can not be updated. Auto update is only available for routers. Please update it manually`);
                        return;
                    }

                    addAvailableDevice(msg.device);

                    if (isAutoUpdateEnabled() === true && isUpdating === false) {
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
                    node.status({ fill: "red", text: "error - updated failed" })
                    break;
                case "update_progress":
                    setUpdateFlag(true);
                    setCurrentDevice(msg.device);
                    node.status({ fill: "yellow", text: `Updating... ${msg.progress}%` });
                    node.send([undefined, {
                        payload: {
                            device: msg.device,
                            message: "Progress changed",
                            progress: msg.progress
                        }
                    }]);
                    break;
                case "update_succeeded":
                    setUpdateFlag(false);

                    const index = updateableDevices.indexOf(msg.device);
                    if (index > -1) {
                        updateableDevices.splice(index, 1);
                    }
                    nodeContext.set("updates_available", updateableDevices);
                    cleanup();

                    if (isAutoUpdateEnabled() === true && updateableDevices.length > 0) {
                        node.status({ fill: "grey", text: "Next update will start in 5 seconds...." });
                        setTimeout(function () {
                            startNext();
                        }, 5000)
                    } else {
                        refreshStatus();
                    }

                    node.send({
                        payload: {
                            device: msg.device,
                            message: "Update succeded",
                            devicesQueued: updateableDevices.length > 0
                        }
                    });
                    break;
            }
        }

        function cleanup() {
            bridgeNode.unsubscribe(node.id);
            bridgeNode.setDeviceState(currentDevice, currentDeviceState);
            setCurrentDevice("");
            setCurrentDeviceState(null);
        }

        function deviceStatusReceived(deviceName, msg) {
            if (deviceName !== currentDevice) {
                if (msg.update_available === true) {
                    addAvailableDevice(deviceName);
                    if (isAutoUpdateEnabled() === true) {
                        startNext();
                    }
                }

                return;
            }

            if (currentDevice !== "") {
                setCurrentDeviceState(msg);
            }
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
            if (updateableDevices.indexOf(device) === -1) {
                updateableDevices.push(device);
                nodeContext.set("updates_available", updateableDevices);

                if (isUpdating !== true) {
                    refreshStatus();
                }
            }
        }

        function startNext() {
            if (updateableDevices.length > 0) {
                startUpdate(updateableDevices[0])
            }
        }

        function startUpdate(device) {
            if (!device) {
                node.error("msg.payload.device was not set");
                return;
            }

            var found = bridgeNode.getDeviceList().find(d => d.friendly_name == device);
            if (!found) {
                node.error("Device not found");
                return;
            }

            if (isUpdating === true) {
                addAvailableDevice(device);
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

        function refreshStatus() {
            if (isUpdating === true) {
                node.status({ fill: "yellow", text: "Updating..." });
            } else if (updateableDevices.length > 0) {
                node.status({ fill: "blue", text: updateableDevices.length + " updates available" });
            } else {
                node.status({ fill: "green", text: "ready" });
            }
        }

        function isAutoUpdateEnabled() {
            return config.autoUpdate === true || overrideAutoUpdate === true;
        }

        node.on('input', function (msg) {
            if (msg.payload.autoUpdate !== undefined) {
                overrideAutoUpdate = msg.payload.autoUpdate;
                if (overrideAutoUpdate) {
                    startNext();
                }
                return;
            }

            startUpdate(msg.payload.device);
        });

        node.on('close', function () {
            bridgeNode.unsubscribe(node.id);
        });

        refreshStatus();

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