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
    RED.nodes.registerType("zigbee2mqtt-device-config", deviceConfig)

    function bridgeConfig(config) {
        RED.nodes.createNode(this, config);
        var mqtt = require('mqtt')
        this.name = config.name;
        this.baseTopic = config.baseTopic;
        this.broker = config.broker;
        this.requireLogin = config.requireLogin;
        var _subs = [];
        var knownDevices = [];
        var node = this;
        var devicesContextName = "z2m_devices_" + node.id.replace(".", "_");
        var globalContext = node.context().global;

        var options = {};
        if (node.requireLogin) {
            options = {
                username: this.credentials.username,
                password: this.credentials.password
            };
        }

        var client = mqtt.connect(this.broker, options);

        this.isConnected = function () { return client.connected; };
        this.isReconnecting = function () { return client.reconnecting; };
        this.publish = function (topic, message) { client.publish(topic, message); };
        this.refreshDevice = function (deviceName) {
            client.publish(node.baseTopic + "/" + deviceName + "/get", '{"state": ""}');
        };
        this.getDeviceList = function () {
            return globalContext.get(devicesContextName) || [];
        };
        this.subscribeDevice = function (nodeId, device, callback) {
            var topic = node.baseTopic + "/" + device;
            this.subscribe(nodeId, topic, callback);
        };
        this.subscribe = function (nodeId, topic, callback) {
            var sub = _subs.find(e => e.nodeId == nodeId);
            if (sub) {
                if (sub.topic !== topic) {
                    client.unsubscribe(sub.topic);
                }

                sub.topic = topic;
                sub.callback = callback;
            } else {
                sub = {
                    nodeId: nodeId,
                    topic: topic,
                    callback: callback
                }

                _subs.push(sub);
            }

            client.subscribe(topic);
            return true;
        };
        this.unsubscribe = function (nodeId) {
            var sub = _subs.find(e => e.nodeId == nodeId);
            if (sub) {
                var topic = sub.topic;
                var index = _subs.indexOf(sub);
                _subs.splice(index, 1);
                if (!_subs.some(s => s.topic == topic)) {
                    client.unsubscribe(sub.topic);
                }
            }
        };

        client.on('message', function (topic, message) {
            try {
                message = JSON.parse(message);

                if (topic === node.baseTopic + "/bridge/log") {
                    if (message.type === "devices") {
                        message.message.forEach(element => {
                            if (!knownDevices.some(dev => { return dev.friendly_name == element.friendly_name; })) {
                                knownDevices.push(element);
                                bavaria.observer.notify(element.friendly_name, { bridgeLogReceived: true });
                            }
                        });

                        globalContext.set(devicesContextName, knownDevices);
                    } else if (topic == node.baseTopic + "/bridge/log") {
                        switch (message.type) {
                            case "zigbee_publish_error":
                                if (message.message.endsWith("'No network route' (205))'")) {
                                    var name = message.message.substr(0, message.message.indexOf("failed:") - 2);
                                    name = name.substr(name.lastIndexOf("'") + 1);
                                    bavaria.observer.notify(name + "_routeError", {});
                                }
                                break;
                        }
                    }
                } else {
                    var subs = _subs.filter(e => e.topic === topic);
                    subs.forEach(e => {
                        try {
                            e.callback(message);
                        } catch (err) {
                            console.log(err);
                        }
                    });

                    var deviceName = topic.substr(node.baseTopic.length + 1);
                    bavaria.observer.notify(deviceName, message);
                }
            } catch (err) {
                node.error(err);
            }
        });

        client.on('connect', function () {
            client.subscribe(node.baseTopic + "/bridge/log");

            if (node.getDeviceList().length == 0) {
                client.publish(node.baseTopic + "/bridge/config/devices", "");
            }

            bavaria.observer.notify(node.id + "_connected", {});
        });

        node.on("close", function(){
           client.end(true);
        });
    }
    RED.nodes.registerType("zigbee2mqtt-bridge-config", bridgeConfig, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
}