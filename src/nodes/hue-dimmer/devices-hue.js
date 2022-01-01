module.exports = function (RED) {
    const utils = require("../../lib/utils.js");
    const bavaria = utils.bavaria();

    function hueDimmerSwitch(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        const regId = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                if (message.action === undefined || message.action === "" || message.action === null) {
                    // Ignore message with empty action
                    return;
                }
                
                message.action = message.action.split("-").join("_");

                const ioMap = {};
                ioMap["on_press"] = utils.createButtonOutput(0, "on", "pressed");
                ioMap["on_hold"] = utils.createButtonOutput(0, "on", "hold");
                ioMap["on_hold_release"] = utils.createButtonOutput(0, "on", "released");
                ioMap["off_press"] = utils.createButtonOutput(1, "off", "pressed");
                ioMap["off_hold"] = utils.createButtonOutput(1, "off", "hold");
                ioMap["off_hold_release"] = utils.createButtonOutput(1, "off", "released");
                ioMap["up_press"] = utils.createButtonOutput(2, "up", "pressed");
                ioMap["up_hold"] = utils.createButtonOutput(2, "up", "hold");
                ioMap["up_hold_release"] = utils.createButtonOutput(2, "up", "released");
                ioMap["down_press"] = utils.createButtonOutput(3, "down", "pressed");
                ioMap["down_hold"] = utils.createButtonOutput(3, "down", "hold");
                ioMap["down_hold_release"] = utils.createButtonOutput(3, "down", "released");

                var output = ioMap[message.action];
                utils.sendAt(node, output.index, {
                    payload: {
                        button_name: output.button_name,
                        button_type: output.button_type,
                    }
                });
            });
        });

        node.on("close", ()=>{
            bavaria.observer.unregister(regId);
        });
    }
    RED.nodes.registerType("hue-dimmer-switch", hueDimmerSwitch);
};
