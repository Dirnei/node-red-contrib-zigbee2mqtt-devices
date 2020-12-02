"use strict";
var types_1 = require("./types");
var nodeInit = function (RED) {
    var utils = require("./lib/utils.js");
    var bavaria = utils.bavaria();
    function DeviceConfigNodeConstructor(config) {
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
    RED.nodes.registerType("zigbee2mqtt-device-config", DeviceConfigNodeConstructor);
    function BridgeConfigConstructor(config) {
        var _this = this;
        RED.nodes.createNode(this, config);
        var EventEmitter = require("events");
        var emitter = new EventEmitter();
        var node = this;
        var mqttNode = RED.nodes.getNode(config.mqtt);
        var globalContext = node.context().global;
        this.name = config.name;
        this.baseTopic = config.baseTopic;
        this.isConnected = mqttNode.isConnected;
        this.isReconnecting = mqttNode.isReconnecting;
        this.publish = mqttNode.publish;
        this.knownDevices = globalContext.get("knownDevices" + node.id.replace(".", "_")) || [];
        // @ts-ignore FIXME: hmmmm
        this.on = function (event, listener) {
            emitter.on(event, listener);
        };
        this.getDeviceList = function () {
            return this.knownDevices;
        };
        this.subscribeDevice = function (nodeId, device, callback) {
            mqttNode.subscribeDevice(nodeId, node.baseTopic + "/" + device, callback);
        };
        this.publishDevice = function (device, msg) {
            if (typeof msg !== "string") {
                msg = JSON.stringify(msg);
            }
            mqttNode.publish(node.baseTopic + "/" + device + "/set", msg);
        };
        this.subscribe = mqttNode.subscribe;
        this.unsubscribe = mqttNode.unsubscribe;
        this.setDeviceState = function (device, payload) {
            if (device !== undefined && device !== "") {
                try {
                    payload = JSON.stringify(payload);
                    _this.publish(node.baseTopic + "/" + device + "/set", payload);
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        this.refreshDevice = function (deviceName) {
            if (deviceName !== "" && deviceName !== "---") {
                // eslint-disable-next-line quotes
                mqttNode.publish(node.baseTopic + "/" + deviceName + "/get", '{"state": ""}');
            }
        };
        var registeredOtaNodeId = "";
        var otaCallback = function (msg) { };
        var otaDeviceCallback = function (deviceName, msg) { };
        this.registerOtaNode = function (nodeId, otaStatusCallback, deviceStatusCallback) {
            if (registeredOtaNodeId !== "" && registeredOtaNodeId !== nodeId) {
                return false;
            }
            registeredOtaNodeId = nodeId;
            otaCallback = otaStatusCallback;
            otaDeviceCallback = deviceStatusCallback;
            return true;
        };
        var subId = bavaria.observer.register(mqttNode.id + "_connected", function (_msg) {
            mqttNode.subscribe(node.id, node.baseTopic + "/+", function (msg, topic) {
                var deviceName = topic.substr(node.baseTopic.length + 1);
                bavaria.observer.notify(deviceName, msg);
                otaDeviceCallback(deviceName, msg);
            });
            mqttNode.subscribe(node.id + 1, node.baseTopic + "/bridge/log", function (msg) {
                switch (msg.type) {
                    case "devices":
                        msg.message.forEach(function (device) {
                            var d = node.knownDevices.find(function (e) {
                                return e.ieeeAddr === device.ieeeAddr;
                            });
                            if (d) {
                                // replace already known device
                                var index = node.knownDevices.indexOf(d);
                                node.knownDevices.splice(index, 1, device);
                            }
                            else {
                                // new device
                                node.knownDevices.push(device);
                            }
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
                    case "groups": break;
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
    RED.nodes.registerType("zigbee2mqtt-bridge-config", BridgeConfigConstructor, {
        credentials: types_1.BridgeConfigCredentials,
    });
};
module.exports = nodeInit;
