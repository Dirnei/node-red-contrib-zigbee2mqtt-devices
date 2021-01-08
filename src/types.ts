import { MqttClient } from "mqtt";
import { Node, NodeCredentials, NodeDef, NodeMessage } from "node-red";

export interface DeviceConfigOptions {
    name: string,
    bridge: string
    // bridge: { value: "", type: "zigbee2mqtt-bridge-config" },
    deviceName: string
    brightnessSupport: boolean
    temperatureSupport: boolean
    colorSupport: boolean
    genericMqttDevice: boolean
    statusTopic: string
    commandTopic: string
    refreshTopic: string
}

export interface DeviceConfigNodeDef extends NodeDef, DeviceConfigOptions { }

export interface DeviceConfigNode extends Node {
    bridge: string
    deviceName: string
    brightnessSupport: boolean
    temperatureSupport: boolean
    colorSupport: boolean
    genericMqttDevice: boolean
    statusTopic: string
    commandTopic: string
    refreshTopic: string
}

export interface BridgeConfigOptions {

}

export interface BridgeConfigCredentials {
    username: string;
    password: string;
}

export const BridgeConfigCredentials: NodeCredentials<BridgeConfigCredentials> = {
    username: { type: "text" },
    password: { type: "password" },
};

export interface BridgeConfigOptions {
    name: string
    mqtt: string
    broker: string
    baseTopic: string // default "zigbee2mqtt"
    enabledLogging: boolean
    allowDeviceStatusRefresh: boolean
}

export interface BridgeConfigNode extends Node<BridgeConfigCredentials> {
    isConnected: MqttConfigNode["isConnected"]
    isReconnecting: MqttConfigNode["isReconnecting"]
    baseTopic: string
    publish: MqttConfigNode["publish"]
    knownDevices: Array<Z2mDeviceContextObsolete>
    getDeviceList: (callback: () => void) => Array<Z2mDeviceContextObsolete>
    subscribeDevice: MqttConfigNode["subscribeDevice"]
    publishDevice: (device: string, msg: string | any) => void
    subscribe: MqttConfigNode["subscribe"]
    unsubscribe: MqttConfigNode["unsubscribe"]
    setDeviceState: (device: string | undefined, payload: string) => void
    refreshDevice: (deviceName: string, force:boolean) => void
    registerOtaNode: (nodeId: string, otaStatusCallback: OtaStatusCallback, deviceStatusCallback: DeviceStatusCallback) => void
}

export interface BridgeConfigNodeDef extends NodeDef, BridgeConfigOptions { }

export type OtaStatusCallback = (msg: any) => void
export type DeviceStatusCallback = (deviceName: string, msg: any) => void

export interface MqttConfigCredentials {
    username: string;
    password: string;
}

export const MqttConfigCredentials: NodeCredentials<MqttConfigCredentials> = {
    username: { type: "text" },
    password: { type: "password" },
};

// TODO: Switch to core-mqtt from node-red
export type MqttConfigOptions = {
    name: string
    protocol?: string // default: mqtt
    broker: string // default: localhost
    requireLogin: boolean
}

export interface NodeMqttBroker extends Node {
    register: (mqttNode: Node) => void;
    deregister: (mqttNode: Node, done: () => void) => void;
    subscribe: (topic: string, qos: number, callback: NodeMqttBrokerMessageCallback, ref : any) => void;
    publish: (topic: NodeMessage, done?: () => void) => void;
    connected: boolean
}

export type NodeMqttMessage = NodeMessage & {
    topic: string,
    retain: boolean
    qos:number
}

export type NodeMqttBrokerMessageCallback = (topic: string, payload: any, packet: any) => void;

export interface MqttConfigNode extends Node<MqttConfigCredentials> {
    broker: string
    requireLogin: boolean
    isConnected: () => MqttClient['connected']
    isReconnecting: () => MqttClient['reconnecting']
    publish: (topic: string, message: string | Buffer) => void //  MqttClient['publish'] (return type void instant of client)
    mqttClient: MqttClient
    subscribeDevice: (nodeId: string, topic: string, callback: MqttConfigCallback) => void
    subscribe: (nodeId: string, topic: string, callback: MqttConfigCallback, jsonPayload?: boolean) => void
    unsubscribe: (nodeId: string) => void
}

export interface MqttConfigNodeDef extends NodeDef, MqttConfigOptions { }

export type MqttConfigCallback = (message: any, topic: string) => void

export type MqttConfigSubsType = {
    nodeId: string,
    topic: string,
    callback: MqttConfigCallback
    isDevice: boolean
}

export type Z2mDeviceContextObsolete = {
    ieeeAddr: string,
    friendly_name: string,
    model: string,
    vendor: string
    type: string
}

export type Z2mDevice = {
    type: string,
    ieee_address: string,
    friendly_name: string,
    definition: Z2mDeviceDefinition,
}

export type Z2mDeviceDefinition = {
    model: string,
    vendor: string
}