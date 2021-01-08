import { throws } from "assert";
import { type } from "jquery";
import { NodeInitializer, NodeMessage } from "node-red";
import {
    BridgeConfigCredentials,
    BridgeConfigNode,
    BridgeConfigNodeDef,
    DeviceConfigNode,
    DeviceConfigNodeDef,
    DeviceStatusCallback,
    MqttConfigNode,
    NodeMqttBroker,
    NodeMqttMessage,
    OtaStatusCallback,
    Z2mDevice,
    Z2mDeviceContextObsolete
} from "./types";

import {
    Z2mDeviceDefinition,
    Z2mDeviceEntry,
    Z2mDeviceExposesBase,
    Z2mDeviceExposesFeatures,
    Z2mDeviceListProperty,
    Z2mDeviceProperty,
    Z2mDeviceRangeProperty,
    Z2mDeviceStepableProperty,
    Z2mDeviceSwitchableProperty
} from "./device-types"

import {
    MqttSubscription
} from "./lib/mqtt";

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
        const subscriptions: { [id: string]: Array<MqttSubscription> } = {};

        const node = this;
        const broker = RED.nodes.getNode(config.broker) as NodeMqttBroker;
        const globalContext = node.context().global;

        broker.register(this);
        broker.subscribe(`${config.baseTopic}/#`, 0, (topic, payload, packet) => {
            for (let key in subscriptions) {
                subscriptions[key].forEach(sub => {
                    sub.invokeIfMatch(topic, payload.toString("utf8"));
                });
            }
        }, this.id);

        this.name = config.name;
        this.baseTopic = config.baseTopic;

        this.isConnected = () => broker.connected;
        this.publish = (topic, payload) => {
            let msg: NodeMqttMessage = {
                qos: 0,
                retain: false,
                topic: topic,
                payload: payload
            }

            broker.publish(msg);
        };

        this.knownDevices = globalContext.get(`knownDevices_${node.id.replace(".", "_")}`) as BridgeConfigNode["knownDevices"] || [];

        this.getDeviceList = function (callback) {
            if (this.knownDevices.length === 0 && callback !== undefined) {
                callback();
            }

            return this.knownDevices;
        };

        this.subscribeDevice = function (nodeId, device, callback) {
            this.subscribe(nodeId, `${node.baseTopic}/${device}`, callback, true);
        };

        this.publishDevice = function (device, msg) {
            if (typeof msg !== "string") {
                msg = JSON.stringify(msg);
            }

            this.publish(`${node.baseTopic}/${device}/set`, msg);
        };

        this.subscribe = (nodeId, topic, callback, jsonPayload = true) => {
            if (!topic.startsWith(node.baseTopic)) {
                node.error("Can't subscribe to " + topic);
                return;
            }

            if (!(nodeId in subscriptions)) {
                subscriptions[nodeId] = [];
            }

            subscriptions[nodeId].push(new MqttSubscription(topic, jsonPayload, callback));
        };
        this.unsubscribe = (nodeId) => {

        };

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

        this.refreshDevice = function (deviceName, force) {
            if (deviceName !== "" && deviceName !== "---" && (config.allowDeviceStatusRefresh || force)) {
                this.publish(`${node.baseTopic}/${deviceName}/get`, `{"state": ""}`)
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

        if (config.enabledLogging === true) {
            this.subscribe(node.id, `${config.baseTopic}/bridge/logging`, (message) => {
                node.error(message);
                if (message.level.startsWith("warn")) {
                    node.warn(message.message);
                } else if (message.level.startsWith("err")) {
                    node.error(message.message);
                }
            });
        }

        this.subscribe(node.id, `${config.baseTopic}/bridge/state`, (message) => {
            if (message === "online") {
                bavaria.observer.notify(node.id + "_connected");
            }
        }, false);

        this.subscribe(node.id, `${config.baseTopic}/bridge/devices`, (message) => {
            handleDeviceMessage(message);
        });

        function handleDeviceMessage(msg: Array<Z2mDeviceEntry>) {
            msg.forEach((device: Z2mDeviceEntry) => {
                const d = node.knownDevices.find(e => {
                    return e.ieee_address === device.ieee_address;
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

            globalContext.set(`knownDevices_${node.id.replace(".", "_")}`, node.knownDevices)
        }

       

        node.on("close", function (done: () => void) {
            broker.deregister(node, done);
        });
    }

    RED.nodes.registerType("zigbee2mqtt-bridge-config", BridgeConfigConstructor, {
        credentials: BridgeConfigCredentials,
    });
};

export = nodeInit;