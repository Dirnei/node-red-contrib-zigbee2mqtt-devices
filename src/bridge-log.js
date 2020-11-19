module.exports = function (RED) {
    const OutputHandler = require("../lib/outputHandler.js");
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function bridgeLog(config) {
        RED.nodes.createNode(this, config);
        const bridgeNode = RED.nodes.getNode(config.bridge);
        const node = this;

        const outputHandler = new OutputHandler();
        
        outputHandler.addOutput(0, "Consolidated logs", "consolidated_logs", "Consolidated logs from te bridge log", msg => { msg.message; });
        
        let outputCount = 1;

        // Create a list of log message types to listen to
        const enabledLogTypes = new Array();

        
        
        

        Object.keys(config).forEach(function(key) {
            if(key.startsWith("type_") && config[key]) {
                const logType = key.replace("type_", "");
                enabledLogTypes.push(logType);
                node.warn(logType);
                outputHandler.addOutput(outputCount, logType, logType, "Logs with the type: " + logType, msg => { msg.message; });
                outputCount++;
            }
        });

        node.warn(enabledLogTypes);
        utils.setConnectionState(bridgeNode, node);

        bridgeNode.on("bridge-log", (message)=>{
            node.warn(message);
            // Check if the log type is configured
            if (enabledLogTypes.indexOf(message.payload) >= 0) {
                node.send(outputHandler.prepareOutput("type", message));
            }
        });

        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
        });
    }
    RED.nodes.registerType("bridge-log", bridgeLog);
};