module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function bridgeLog(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });

            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                if (message.contact) {
                    node.send({ payload: message });
                } else {
                    node.send([null, { payload: message }]);
                }
            });
        });
    }
    RED.nodes.registerType("bridge-log", bridgeLog);
}