import {Node, NodeDef, NodeMessage} from "node-red";


export type OverridePayload = { override: OverrideStatePayload | OverrideBrightnessPayload | OverrideTemperaturePayload | OverrideColorPayload | OverrideActionPayload }

/*********
 * OverrideState
 */
export interface OverrideStateOptions {
    state: "ON" | "OFF" | "TOGGLE" // default ON
}

export interface OverrideStateNodeDef extends NodeDef, OverrideStateOptions {
}

export interface OverrideStateNode extends Node {
    state: OverrideStateOptions['state']

    send(msg: OverrideSateMessageOut): void
}

export interface OverrideSateMessageOut extends NodeMessage {
    payload: {
        override: OverrideStatePayload
    }
}

export type OverrideStatePayload = {
    state: OverrideStateOptions['state']
}

/*********
 * OverrideState
 */
export interface OverrideBrightnessOptions {
    brightness: number
}

export interface OverrideBrightnessNodeDef extends NodeDef, OverrideBrightnessOptions {
}

export interface OverrideBrightnessNode extends Node {

    send(msg: OverrideBrightnessMessageOut): void
}

export interface OverrideBrightnessMessageOut extends NodeMessage {
    payload: {
        override: OverrideBrightnessPayload
    }
}

export type OverrideBrightnessPayload = {
    brightness: OverrideBrightnessOptions['brightness']
}


/*********
 * OverrideTemperature
 */
export interface OverrideTemperatureOptions {
    temperature: number
}

export interface OverrideTemperatureNodeDef extends NodeDef, OverrideTemperatureOptions {
}

export interface OverrideTemperatureNode extends Node {

    send(msg: OverrideTemperatureMessageOut): void
}

export interface OverrideTemperatureMessageOut extends NodeMessage {
    payload: {
        override: OverrideTemperaturePayload
    }
}

export type OverrideTemperaturePayload = {
    temperature: OverrideTemperatureOptions['temperature']
}


/*********
 * OverrideColor
 */
export interface OverrideColorOptions {
    red: number
    green: number
    blue: number
}

export interface OverrideColorNodeDef extends NodeDef, OverrideColorOptions {
}

export interface OverrideColorNode extends Node {

    send(msg: OverrideColorMessageOut): void
}

export interface OverrideColorMessageOut extends NodeMessage {
    payload: {
        override: OverrideColorPayload
    }
}

export type OverrideColorPayload = {
    color: {
        r: OverrideColorOptions['red']
        g: OverrideColorOptions['green']
        b: OverrideColorOptions['blue']
    }
}


/*********
 * OverrideAction
 */
export type ActionTypes = "brightness_move" | "brightness_step" | "color_temp_move" | "color_temp_step" | "hue_move" | "hue_step" | "saturation_move" | "saturation_step"

export interface OverrideActionOptions {
    value: number
    mode: ActionTypes

}

export interface OverrideActionNodeDef extends NodeDef, OverrideActionOptions {
}

export interface OverrideActionNode extends Node {

    send(msg: OverrideActionMessageOut): void
}

export interface OverrideActionMessageOut extends NodeMessage {
    payload: {
        override: OverrideActionPayload
    }
}

export type OverrideActionPayload = {}


