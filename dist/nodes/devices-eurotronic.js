"use strict";
module.exports = function (RED) {
    var utils = require("../lib/utils.js");
    var bavaria = utils.bavaria();
    function createEurotronicsSpirit(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var bridgeNode = RED.nodes.getNode(config.bridge);
        if (config.windowSensor !== undefined) {
            bridgeNode.subscribeDevice(node.id, config.windowSensor, function (msg) {
                bridgeNode.publishDevice(config.deviceName, {
                    eurotronic_host_flags: {
                        window_open: !msg.contact,
                    }
                });
            });
        }
        bridgeNode.subscribeDevice(node.id + "1", config.deviceName, function (msg) {
            var text = "Battery: " + msg.battery + "% ";
            text += "T: " + msg.local_temperature + "\u00B0 ";
            text += "SP: " + msg.current_heating_setpoint + "\u00B0";
            node.status({ fill: "green", text: text });
        });
        function containsProperty(msg, name, type) {
            return msg.payload[name] !== undefined && typeof msg.payload[name] == type;
        }
        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
        });
        node.on("input", function (msg) {
            if (containsProperty(msg, "heatingSetpoint", "number")
                || containsProperty(msg, "child_protection", "boolean")
                || containsProperty(msg, "mirror_display", "boolean")) {
                if (msg.payload.devices === undefined) {
                    msg.payload.devices = [];
                }
                var device = {
                    topic: config.deviceName,
                    current_heating_setpoint: msg.payload.heatingSetpoint,
                    eurotronic_host_flags: {
                        child_protection: msg.payload.child_protection !== undefined ? msg.payload.child_protection : config.childProtection === true,
                        mirror_display: msg.payload.mirror_display !== undefined ? msg.payload.mirror_display : config.mirrorDisplay === true,
                    },
                    target: "z2m"
                };
                msg.payload.heatingSetpoint = undefined;
                msg.payload.child_protection = undefined;
                msg.payload.mirror_display = undefined;
                msg.payload.devices.push(device);
                node.send(msg);
            }
        });
        node.on("close", function () {
        });
    }
    RED.nodes.registerType("eurotronic-spirit", createEurotronicsSpirit);
};
