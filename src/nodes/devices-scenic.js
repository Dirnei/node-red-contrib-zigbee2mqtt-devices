
module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function scenicSwitch(config) {
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

                var ioMap = {
                    press_1: utils.createButtonOutput(0, "A0", "pressed"),
                    release_1: utils.createButtonOutput(0, "A0", "released"),
                    press_2: utils.createButtonOutput(1, "A1", "pressed"),
                    release_2: utils.createButtonOutput(1, "A1", "released"),
                    press_3: utils.createButtonOutput(2, "B0", "pressed"),
                    release_3: utils.createButtonOutput(2, "B0", "released"),
                    press_4: utils.createButtonOutput(3, "B1", "pressed"),
                    release_4: utils.createButtonOutput(3, "B1", "released"),
                    press_1_and_3: utils.createButtonOutput(4, "UP", "pressed"),
                    release_1_and_3: utils.createButtonOutput(4, "UP", "released"),
                    press_2_and_4: utils.createButtonOutput(5, "DOWN", "pressed"),
                    release_2_and_4: utils.createButtonOutput(5, "DOWN", "released"),
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

        node.on("close", ()=>{
            bavaria.observer.unregister(regId);
        });
    }
    RED.nodes.registerType("scenic-foh-switch", scenicSwitch);
};