
module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function scenicSwitch(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        let regId = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                var ioMap = {
                    recall_scene_0: utils.createButtonOutput(0, "A0", "pressed"),
                    recall_scene_4: utils.createButtonOutput(0, "A0", "released"),
                    recall_scene_1: utils.createButtonOutput(1, "A1", "pressed"),
                    recall_scene_5: utils.createButtonOutput(1, "A1", "released"),
                    recall_scene_3: utils.createButtonOutput(2, "B0", "pressed"),
                    recall_scene_7: utils.createButtonOutput(2, "B0", "released"),
                    recall_scene_2: utils.createButtonOutput(3, "B1", "pressed"),
                    recall_scene_6: utils.createButtonOutput(3, "B1", "released"),
                    press_2_of_2: utils.createButtonOutput(4, "UP", "pressed"),
                    release_2_of_2: utils.createButtonOutput(4, "UP", "released"),
                    press_1_of_2: utils.createButtonOutput(5, "DOWN", "pressed"),
                    release_1_of_2: utils.createButtonOutput(5, "DOWN", "released"),
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