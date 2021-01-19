import {NodeAPI, NodeMessageInFlow} from "node-red";
import {
    OverrideActionNode,
    OverrideActionNodeDef,
    OverrideBrightnessNode,
    OverrideBrightnessNodeDef,
    OverrideColorNode,
    OverrideColorNodeDef,
    OverrideStateNode,
    OverrideStateNodeDef,
    OverrideTemperatureNode,
    OverrideTemperatureNodeDef
}                                   from "./types";

module.exports = function (RED: NodeAPI) {
    const utils = require("../../lib/utils.js");
    const bavaria = utils.bavaria();

    function PayloadOverride<T extends NodeMessageInFlow, U extends {}>(msg: T, payload: U): asserts msg is (T & { payload: { override: U } }) {
        Object.assign(msg, {
            payload: {
                ...msg.payload as object,
                override: {
                    // @ts-ignore TODO: Weg finden welcher TypeGuard sagt was sache ist
                    ...(typeof msg.payload === "object" && msg.payload !== null && ("override" in msg.payload) && msg.payload.override),
                    ...payload
                }
            }
        });
    }

    /**
     *
     * @param config
     * @constructor
     */
    function OverrideStateConstructor(this: OverrideStateNode, config: OverrideStateNodeDef) {
        RED.nodes.createNode(this, config);

        this.on("input", (msg: NodeMessageInFlow) => {
            PayloadOverride(msg, {state: config.state});
            this.send(msg);
        });
    }

    RED.nodes.registerType("override-state", OverrideStateConstructor);

    /**
     *
     * @param config
     * @constructor
     */
    function OverrideBrightnessConstructor(this: OverrideBrightnessNode, config: OverrideBrightnessNodeDef) {
        RED.nodes.createNode(this, config);

        this.on("input", (msg) => {
            PayloadOverride(msg, {brightness: config.brightness});
            this.send(msg);
        });
    }

    RED.nodes.registerType("override-brightness", OverrideBrightnessConstructor);

    /**
     *
     * @param config
     * @constructor
     */
    function OverrideTemperatureConstructor(this: OverrideTemperatureNode, config: OverrideTemperatureNodeDef) {
        RED.nodes.createNode(this, config);
        this.on("input", (msg) => {

            PayloadOverride(msg, {temperature: config.temperature});
            this.send(msg);
        });
    }

    RED.nodes.registerType("override-temperature", OverrideTemperatureConstructor);

    /**
     *
     * @param config
     * @constructor
     */
    function OverrideColorConstructor(this: OverrideColorNode, config: OverrideColorNodeDef) {
        RED.nodes.createNode(this, config);
        this.on("input", (msg) => {
            PayloadOverride(msg, {
                color: {
                    r: config.red,
                    g: config.green,
                    b: config.blue,
                }
            });
            this.send(msg);
        });
    }

    RED.nodes.registerType("override-color", OverrideColorConstructor);

    /**
     *
     * @param config
     * @constructor
     */
    function OverrideActionConstructor(this: OverrideActionNode, config: OverrideActionNodeDef) {
        RED.nodes.createNode(this, config);

        this.on("input", (msg) => {

            switch (config.mode) {
                case "brightness_move":
                    PayloadOverride(msg, {action: utils.payloads.createBrightnessMove(config.value)});
                    break;
                case "brightness_step":
                    PayloadOverride(msg, {action: utils.payloads.createBrightnessStep(config.value)});
                    break;
                case "color_temp_move":
                    PayloadOverride(msg, {action: utils.payloads.createColorTempMove(config.value)});
                    break;
                case "color_temp_step":
                    PayloadOverride(msg, {action: utils.payloads.createColorTempStep(config.value)});
                    break;
                case "hue_move":
                    PayloadOverride(msg, {action: utils.payloads.createHueMove(config.value)});
                    break;
                case "hue_step":
                    PayloadOverride(msg, {action: utils.payloads.createHueStep(config.value)});
                    break;
                case "saturation_move":
                    PayloadOverride(msg, {action: utils.payloads.createSaturationMove(config.value)});
                    break;
                case "saturation_step":
                    PayloadOverride(msg, {action: utils.payloads.createSaturationStep(config.value)});
                    break;
            }
            msg.payload.override = msg.payload.override.action.payload.override;
            this.send(msg);
        });
    }

    RED.nodes.registerType("override-action", OverrideActionConstructor);
};