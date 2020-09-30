module.exports = function (RED) {
    const utils = require("./utils.js");
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
                    brightness_down: utils.createButtonOutput(3, "dimm_down", "hold"),
                    brightness_stop: utils.createButtonOutput(4, "dimm_stop", "released"),
                };

                var output = ioMap[message.click];
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
                    brightnessup_release: utils.createButtonOutput(1, "brightness_up", "released",),
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
}