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
        var node = this;
        var mqttNode = RED.nodes.getNode(config.mqtt);

        this.name = config.name;
        this.baseTopic = config.baseTopic;

        this.isConnected = mqttNode.isConnected;
        this.isReconnecting = mqttNode.reconnecting;
        this.publish = mqttNode.publish;
        this.subscribeDevice = function (nodeId, device, callback) {
            var topic = node.baseTopic + "/" + device;
            mqttNode.subscribeDevice(nodeId, topic, callback, true);
        };
        this.subscribe = mqttNode.subscribe;
        this.unsubscribe = mqttNode.unsubscribe;

        this.refreshDevice = function (deviceName) {
            // eslint-disable-next-line quotes
            mqttNode.publish(node.baseTopic + "/" + deviceName + "/get", '{"state": ""}');
        };

        var subId = bavaria.observer.register(mqttNode.id + "_connected", function (_msg) {
            mqttNode.subscribe(node.id, node.baseTopic + "/+", (msg) => { });
            bavaria.observer.notify(node.id + "_connected");
        });

        node.on("close", function(){
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