import {MqttClient}                     from "mqtt";
import {Node, NodeCredentials, NodeDef} from "node-red";

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

export interface DeviceConfigNodeDef extends NodeDef, DeviceConfigOptions {}

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
    baseTopic: string // default "zigbee2mqtt"
}
export interface BridgeConfigNode extends Node<BridgeConfigCredentials> {
    isConnected: MqttConfigNode["isConnected"]
    isReconnecting: MqttConfigNode["isReconnecting"]
    baseTopic: string
    publish: MqttConfigNode["publish"]
    knownDevices: Array<Zigbee2mqttDevice>
    getDeviceList: () => Array<Zigbee2mqttDevice>
    subscribeDevice: MqttConfigNode["subscribeDevice"]
    publishDevice: (device: string, msg: string | any) => void
    subscribe: MqttConfigNode["subscribe"]
    unsubscribe: MqttConfigNode["unsubscribe"]
    setDeviceState: (device: string | undefined, payload: string) => void
    refreshDevice: (deviceName: string) => void
    registerOtaNode: (nodeId: string, otaStatusCallback: OtaStatusCallback, deviceStatusCallback: DeviceStatusCallback) => void
}

export interface BridgeConfigNodeDef extends NodeDef, BridgeConfigOptions {}


export type OtaStatusMessage = {
    device: MqttConfigCallbackMessageMeta['device']
    status: MqttConfigCallbackMessageMeta['status']
    progress: MqttConfigCallbackMessageMeta['progress']
    message: Array<Zigbee2mqttDevice>
}

export type OtaStatusCallback = (msg: OtaStatusMessage) => void
export type DeviceStatusCallback = (deviceName: string, msg: MqttConfigCallbackMessage) => void






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


export interface MqttConfigNode extends Node<MqttConfigCredentials> {
    broker: string
    requireLogin: boolean
    isConnected: () => MqttClient['connected']
    isReconnecting: () => MqttClient['reconnecting']
    publish: (topic: string, message: string | Buffer) => void //  MqttClient['publish'] (return type void instant of client)
    mqttClient: MqttClient
    subscribeDevice: (nodeId: string, topic: string, callback: MqttConfigCallback) => void
    subscribe: (nodeId: string, topic: string, callback: MqttConfigCallback) => void
    unsubscribe: (nodeId: string) => void
}

export type Zigbee2mqttDevice = {
    ieeeAddr: string
}

export interface MqttConfigNodeDef extends NodeDef, MqttConfigOptions {}

export type MqttConfigCallbackMessageMeta = {
    device: unknown
    status: unknown
    progress: unknown
}

export type MqttConfigCallbackMessage = {
    type: "devices" | "groups" | "ota_update"
    message: Array<Zigbee2mqttDevice>
    meta: MqttConfigCallbackMessageMeta
    action?: any
}
export type MqttConfigCallback = (message: MqttConfigCallbackMessage, topic: string) => void

export type MqttConfigSubsType = {
    nodeId: string,
    topic: string,
    callback: MqttConfigCallback
    isDevice: boolean
}
