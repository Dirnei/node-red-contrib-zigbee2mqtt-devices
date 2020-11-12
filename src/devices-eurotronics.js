module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

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

        node.on("input", function (msg) {
            if (msg.payload.heatingSetpoint !== undefined && typeof msg.payload.heatingSetpoint == "number") {
                if (msg.payload.devices === undefined) {
                    msg.payload.devices = [];
                }

                var device = {
                    topic: config.deviceName,
                    current_heating_setpoint: msg.payload.heatingSetpoint,
                    eurotronic_host_flags : {
                        child_protection: config.childProtection === true,
                        mirror_display: config.mirrorDisplay === true,
                    },
                    target: "z2m"
                };

                msg.payload.devices.push(device);
                node.send(msg);
            }
        });

        node.on("close", function () {
        });
    }

    RED.nodes.registerType("devices-eurotronics", createEurotronicsSpirit);
};
