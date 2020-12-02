"use strict";
module.exports = function (RED) {
    var utils = require("../lib/utils.js");
    var bavaria = utils.bavaria();
    function createTasmota(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var possibleValues = ["on", "off", "toggle", "0", "1", "2"];
        function preparePayload(msg) {
            node.warn(msg);
            return msg;
        }
        node.on("input", function (msg) {
            if (possibleValues.includes(msg.payload.toString().toLowerCase())) {
                utils.payloads.devices.addDevice(msg, {
                    topic: "cmnd/" + config.topic + "/power",
                    state: utils.payloads.convertToOnOff(msg.payload),
                    target: "mqtt",
                    payloadGenerator: preparePayload
                });
                node.send(msg);
            }
        });
        node.on("close", function () {
        });
    }
    RED.nodes.registerType("tasmota", createTasmota);
};
