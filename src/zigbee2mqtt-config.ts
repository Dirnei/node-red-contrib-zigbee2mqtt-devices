import { throws } from "assert";
import { type } from "jquery";
import { NodeInitializer } from "node-red";
import {
    BridgeConfigCredentials,
    BridgeConfigNode,
    BridgeConfigNodeDef,
    DeviceConfigNode,
    DeviceConfigNodeDef,
    DeviceStatusCallback,
    MqttConfigNode,
    OtaStatusCallback,
    Z2mDevice,
    Z2mDeviceContextObsolete
} from "./types";

const nodeInit: NodeInitializer = (RED): void => {

    const utils = require("./lib/utils.js");
    const bavaria = utils.bavaria();

    function DeviceConfigNodeConstructor(this: DeviceConfigNode, config: DeviceConfigNodeDef) {
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


    function BridgeConfigConstructor(this: BridgeConfigNode, config: BridgeConfigNodeDef) {
        RED.nodes.createNode(this, config);


        const EventEmitter = require("events");
        const emitter = new EventEmitter();

        const node = this;
        const mqttNode = RED.nodes.getNode(config.mqtt) as MqttConfigNode;
        const globalContext = node.context().global;

        this.name = config.name;
        this.baseTopic = config.baseTopic;

        this.isConnected = mqttNode.isConnected;
        this.isReconnecting = mqttNode.isReconnecting;
        this.publish = mqttNode.publish;
        this.knownDevices = globalContext.get(`knownDevices_${node.id.replace(".", "_")}`) as BridgeConfigNode["knownDevices"] || [];

        // @ts-ignore FIXME: hmmmm
        this.on = function (event, listener) {
            emitter.on(event, listener);
        };

        this.getDeviceList = function (callback) {
            if (this.knownDevices.length === 0 && callback !== undefined) {
                callback();
            }

            return this.knownDevices;
        };

        this.subscribeDevice = function (nodeId, device, callback) {
            mqttNode.subscribeDevice(nodeId, `${node.baseTopic}/${device}`, callback);
        };

        this.publishDevice = function (device, msg) {
            if (typeof msg !== "string") {
                msg = JSON.stringify(msg);
            }

            mqttNode.publish(`${node.baseTopic}/${device}/set`, msg);
        };

        this.subscribe = mqttNode.subscribe;
        this.unsubscribe = mqttNode.unsubscribe;
        this.setDeviceState = (device, payload) => {

            if (device !== undefined && device !== "") {

                try {
                    payload = JSON.stringify(payload);
                    this.publish(`${node.baseTopic}/${device}/set`, payload);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        this.refreshDevice = function (deviceName) {
            if (deviceName !== "" && deviceName !== "---") {
                mqttNode.publish(`${node.baseTopic}/${deviceName}/get`, `{"state": ""}`);
            }
        };

        let registeredOtaNodeId = "";
        let otaCallback: OtaStatusCallback = () => { };
        let otaDeviceCallback: DeviceStatusCallback = () => { };
        this.registerOtaNode = (nodeId, otaStatusCallback, deviceStatusCallback) => {
            if (registeredOtaNodeId !== "" && registeredOtaNodeId !== nodeId) {
                return false;
            }

            registeredOtaNodeId = nodeId;
            otaCallback = otaStatusCallback;
            otaDeviceCallback = deviceStatusCallback;

            return true;
        };

        const subId = bavaria.observer.register(`${mqttNode.id}_connected`, function (_msg: string) {
            mqttNode.subscribe(node.id, `${node.baseTopic}/+`, (msg, topic) => {
                const deviceName = topic.substr(node.baseTopic.length + 1);
                bavaria.observer.notify(deviceName, msg);
                otaDeviceCallback(deviceName, msg);
            });

            mqttNode.subscribe(node.id + 1, `${node.baseTopic}/bridge/log`, (msg) => {
                switch (msg.type) {
                    case "devices":
                        msg.message.forEach((device: Z2mDeviceContextObsolete) => {
                            const d = node.knownDevices.find(e => {
                                return e.ieeeAddr === device.ieeeAddr;
                            });

                            if (d) {
                                // replace already known device
                                const index = node.knownDevices.indexOf(d);
                                node.knownDevices.splice(index, 1, device);
                            } else {
                                // new device
                                node.knownDevices.push(device);
                            }
                        });

                        globalContext.set(`knownDevices_${node.id.replace(".", "_")}`, node.knownDevices);
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

            mqttNode.subscribe(node.id + 2, `${node.baseTopic}/bridge/devices`, (msg) => {
                node.warn(msg);

                msg.forEach((device: Z2mDevice) => {
                    if (device.definition === null) {
                        if (device.type === "Coordinator") {
                            device.definition = {
                                model: "Coordinator",
                                vendor: "---",
                            }
                        } else {
                            device.definition = {
                                model: "---",
                                vendor: "---",
                            }
                        }
                    }

                    const d = node.knownDevices.find(e => {
                        return e.ieeeAddr === device.ieee_address;
                    });

                    if (d) {
                        // replace already known device
                        let dev: Z2mDeviceContextObsolete = {
                            friendly_name: device.friendly_name,
                            ieeeAddr: device.ieee_address,
                            model: device.definition.model,
                            vendor: device.definition.vendor,
                            type: device.type
                        };

                        const index = node.knownDevices.indexOf(d);
                        node.knownDevices.splice(index, 1, dev);
                    } else {
                        let dev: Z2mDeviceContextObsolete = {
                            friendly_name: device.friendly_name,
                            ieeeAddr: device.ieee_address,
                            model: device.definition.model,
                            vendor: device.definition.vendor,
                            type: device.type
                        };

                        // new device
                        node.knownDevices.push(dev);

                    }
                });

                globalContext.set(`knownDevices_${node.id.replace(".", "_")}`, node.knownDevices)
            });

            //mqttNode.publish(`${config.baseTopic}/bridge/config/devices`, "{}");
            bavaria.observer.notify(node.id + "_connected");
        });

        node.on("close", function () {
            mqttNode.unsubscribe(node.id);
            mqttNode.unsubscribe(node.id + 1);
            bavaria.observer.unregister(subId);
        });
    }

    RED.nodes.registerType("zigbee2mqtt-bridge-config", BridgeConfigConstructor, {
        credentials: BridgeConfigCredentials,
    });
};

export = nodeInit;