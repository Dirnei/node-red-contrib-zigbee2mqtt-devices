module.exports = function (RED) {
    const OutputHandler = require("../lib/outputHandler.js");
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();


    function ikeaDimmer(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                const ioMap = {
                    on: utils.createButtonOutput(0, "on", "pressed"),
                    off: utils.createButtonOutput(1, "off", "pressed"),
                    brightness_up: utils.createButtonOutput(2, "dimm_up", "hold"),
                    brightness_move_up: utils.createButtonOutput(2, "dimm_up", "hold"),
                    brightness_down: utils.createButtonOutput(3, "dimm_down", "hold"),
                    brightness_move_down: utils.createButtonOutput(3, "dimm_down", "hold"),
                    brightness_stop: utils.createButtonOutput(4, "dimm_stop", "released"),
                };

                var output = ioMap[message.action];
                if (output == undefined) {
                    // fallback for legacy payload
                    output = ioMap[message.click];
                }

                utils.sendAt(node, output.index, {
                    payload: {
                        button_name: output.button_name,
                        button_type: output.button_type,
                    }
                });
            });
        });
    }
    RED.nodes.registerType("ikea-dimmer", ikeaDimmer);

    function ikeaRemote(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                message.action = message.action.replace("-", "_");

                const ioMap = {
                    toggle: utils.createButtonOutput(0, "toggle", "pressed"),
                    toggle_hold: utils.createButtonOutput(0, "toggle", "released"),
                    brightness_up_click: utils.createButtonOutput(1, "brightness_up", "pressed"),
                    brightness_up_hold: utils.createButtonOutput(1, "brightness_up", "hold"),
                    brightness_up_release: utils.createButtonOutput(1, "brightness_up", "released",),
                    brightness_down_click: utils.createButtonOutput(2, "brightness_down", "pressed"),
                    brightness_down_hold: utils.createButtonOutput(2, "brightness_down", "hold"),
                    brightness_down_release: utils.createButtonOutput(2, "brightness_down", "released"),
                    arrow_left_click: utils.createButtonOutput(3, "arrow_left", "pressed"),
                    arrow_left_hold: utils.createButtonOutput(3, "arrow_left", "hold"),
                    arrow_left_release: utils.createButtonOutput(3, "arrow_left", "released"),
                    arrow_right_click: utils.createButtonOutput(4, "arrow_right", "pressed"),
                    arrow_right_hold: utils.createButtonOutput(4, "arrow_right", "hold"),
                    arrow_right_release: utils.createButtonOutput(4, "arrow_right", "released")
                };

                var output = ioMap[message.action];
                utils.sendAt(node, output.index, {
                    payload: {
                        button_name: output.button_name,
                        button_type: output.button_type,
                    }
                });
            });
        });
    }
    RED.nodes.registerType("ikea-remote", ikeaRemote);

    function ikeaDimmerV2(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        var handler = new OutputHandler();

        if (config.extendedOutput === true) {
            handler
                .addOutput(0, "on", "on", "pressed")
                .addOutput(0, "on", "brightness_move_up", "hold")
                .addOutput(1, "off", "off", "pressed")
                .addOutput(1, "off", "brightness_move_down", "hold")
                .addOutput(2, "stop", "brightness_stop", "released")
                .addOutput(3, "move_to", "brightness_move_to_level");
        } else {
            handler
                .addOutput(0, "on", "on", "pressed", utils.payloads.overrides.createStateOverride("ON"))
                .addOutput(0, "on", "brightness_move_up", "hold", (msg) => { return utils.payloads.createBrightnessMove(msg.action_rate); })
                .addOutput(0, "off", "off", "pressed", utils.payloads.overrides.createStateOverride("OFF"))
                .addOutput(0, "off", "brightness_move_down", "hold", (msg) => { return utils.payloads.createBrightnessMove(-msg.action_rate); })
                .addOutput(0, "stop", "brightness_stop", "released", utils.payloads.createBrightnessMove("stop"))
                .addOutput(0, "move_to", "brightness_move_to_level", "pressed", (msg) => {
                    return utils.payloads.overrides.createBrightnessOverride(msg.action_level);
                });
        }


        utils.setConnectionState(bridgeNode, node);
        var id = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                message.action = message.action.replace("-", "_");
                var out = handler.prepareOutput("action", message);
                node.send(out);
            });
        });

        node.on("close", function () {
            bavaria.observer.unregister(id);
            bridgeNode.unsubscribe(node.id);
        });
    }

    RED.nodes.registerType("ikea-dimmer-v2", ikeaDimmerV2);
};