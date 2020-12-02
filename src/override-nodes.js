module.exports = function (RED) {
    const utils = require("./lib/utils.js");
    const bavaria = utils.bavaria();

    function overrideState(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            if (msg.payload === undefined || typeof msg.payload != "object") {
                msg.payload = {};
            }

            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.state = config.state;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-state", overrideState);

    function overrideBrightness(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            if (msg.payload === undefined || typeof msg.payload != "object") {
                msg.payload = {};
            }

            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.brightness = config.brightness;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-brightness", overrideBrightness);

    function overrideTemperature(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            if (msg.payload === undefined || typeof msg.payload != "object") {
                msg.payload = {};
            }

            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.temperature = config.temperature;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-temperature", overrideTemperature);

    function overrideColor(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            if (msg.payload === undefined || typeof msg.payload != "object") {
                msg.payload = {};
            }

            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.color = {
                r: config.red,
                g: config.green,
                b: config.blue,
            };

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-color", overrideColor);

    function overrideAction(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            if (msg.payload === undefined || typeof msg.payload != "object") {
                msg.payload = {};
            }

            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            switch (config.mode) {
                case "brightness_move":
                    msg.payload.override.action = utils.payloads.createBrightnessMove(config.value);
                    break;
                case "brightness_step":
                    msg.payload.override.action = utils.payloads.createBrightnessStep(config.value);
                    break;
                case "color_temp_move":
                    msg.payload.override.action = utils.payloads.createColorTempMove(config.value);
                    break;
                case "color_temp_step":
                    msg.payload.override.action = utils.payloads.createColorTempStep(config.value);
                    break;
                case "hue_move":
                    msg.payload.override.action = utils.payloads.createHueMove(config.value);
                    break;
                case "hue_step":
                    msg.payload.override.action = utils.payloads.createHueStep(config.value);
                    break;
                case "saturation_move":
                    msg.payload.override.action = utils.payloads.createSaturationMove(config.value);
                    break;
                case "saturation_step":
                    msg.payload.override.action = utils.payloads.createSaturationStep(config.value);
                    break;
            }
            msg.payload.override = msg.payload.override.action.payload.override;
            node.send(msg);
        });
    }
    RED.nodes.registerType("override-action", overrideAction);
};