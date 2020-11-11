module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function bridgeLog(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        node.warn("warninger");
        node.warn(config);
        node.warn(config.type_device_announced);
        

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            
            

            bavaria.observer.register(bridgeNode.id + "_bridgeLog", message => {
                node.send({ payload: message.message });
            });
            
        });
    }
    RED.nodes.registerType("bridge-log", bridgeLog);
};