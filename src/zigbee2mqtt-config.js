module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function deviceConfig(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.deviceName = config.deviceName;
        this.brightnessSupport = config.brightnessSupport;
        this.temperatureSupport = config.temperatureSupport;
        this.colorSupport = config.colorSupport;
        this.bridge = config.bridge;
        this.genericMqttDevice = config.genericMqttDevice;
        this.statusTopic = config.statusTopic;
        this.commandTopic = config.commandTopic;
        this.refreshTopic = config.refreshTopic;
    }
    RED.nodes.registerType("zigbee2mqtt-device-config", deviceConfig);

    function bridgeConfig(config) {
        RED.nodes.createNode(this, config);

        const EventEmitter = require("events");
        const emitter = new EventEmitter();

        var node = this;
        var mqttNode = RED.nodes.getNode(config.mqtt);
        var globalContext = node.context().global;

        this.name = config.name;
        this.baseTopic = config.baseTopic;

        this.isConnected = mqttNode.isConnected;
        this.isReconnecting = mqttNode.reconnecting;
        this.publish = mqttNode.publish;
        this.knownDevices = globalContext.get("knownDevices" + node.id.replace(".", "_")) || [];

        this.on = function (event, listener) {
            emitter.on(event, listener);
        };

        this.getDeviceList = function () {
            return this.knownDevices;
        };

        this.subscribeDevice = function (nodeId, device, callback) {
            var topic = node.baseTopic + "/" + device;
            mqttNode.subscribeDevice(nodeId, topic, callback, true);
        };
        this.subscribe = mqttNode.subscribe;
        this.unsubscribe = mqttNode.unsubscribe;

        this.refreshDevice = function (deviceName) {
            if (deviceName !== "" && deviceName !== "---") {
                // eslint-disable-next-line quotes
                mqttNode.publish(node.baseTopic + "/" + deviceName + "/get", '{"state": ""}');
            }
        };

        var registeredOtaNodeId = "";
        var otaCallback = (msg) => { };
        var otaDeviceCallback = (deviceName, msg) => { };
        this.registerOtaNode = (nodeId, otaStatusCallback, deviceStatusCallback) => {
            if (registeredOtaNodeId !== "" && registeredOtaNodeId !== nodeId) {
                return false;
            }

            registeredOtaNodeId = nodeId;
            otaCallback = otaStatusCallback;
            otaDeviceCallback = deviceStatusCallback;

            return true;
        };

        var subId = bavaria.observer.register(mqttNode.id + "_connected", function (_msg) {
            mqttNode.subscribe(node.id, node.baseTopic + "/+", (msg, topic) => { 
                var deviceName = topic.substr(node.baseTopic.length + 1);
                bavaria.observer.notify(deviceName, msg);
                otaDeviceCallback(deviceName, msg);
            });
            mqttNode.subscribe(node.id + 1, node.baseTopic + "/bridge/log", (msg) => {
                switch (msg.type) {
                    case "devices":
                        msg.message.forEach(device => {
                            var d = node.knownDevices.find(e => {
                                return e.ieeeAddr === device.ieeeAddr;
                            });
                            if (d) {
                                var index = node.knownDevices.indexOf(d);
                                node.knownDevices.splice(index, 1, device);
                            }

                            node.knownDevices.push(device);
                        });

                        globalContext.set("knownDevices_" + node.id.replace(".", "_"), node.knownDevices);
                        break;
                    case "ota_update":
                        otaCallback({
                            device: msg.meta.device,
                            status: msg.meta.status,
                            progress: msg.meta.progress,
                            message: msg.message,
                        });
                        break;
                    case "groups":
                        break;
                }

                emitter.emit("bridge-log", msg);
            });

            mqttNode.publish(config.baseTopic + "/bridge/config/devices", "{}");
            bavaria.observer.notify(node.id + "_connected");
        });

        node.on("close", function () {
            mqttNode.unsubscribe(node.id);
            mqttNode.unsubscribe(node.id + 1);
            bavaria.observer.unregister(subId);
        });
    }
    RED.nodes.registerType("zigbee2mqtt-bridge-config", bridgeConfig, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
};