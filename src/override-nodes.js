module.exports = function (RED) {
    const utils = require("./utils.js");
    const bavaria = utils.bavaria();
    
    function overrideBrightness(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
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

        node.on('input', function (msg) {
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

        node.on('input', function (msg) {
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
}