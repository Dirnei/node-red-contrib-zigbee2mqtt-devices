module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    RED.nodes.registerType("set-device-values", setDeviceValues);
    function setDeviceValues(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        const regId = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            
        });

        node.on("close", () => {
            bavaria.observer.unregister(regId);
        });
    }
}