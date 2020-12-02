"use strict";
module.exports = function (RED) {
    // @ts-ignore
    var OutputHandler = require("./lib/outputHandler.js");
    var utils = require("./lib/utils.js");
    var bavaria = utils.bavaria();
    /**
     * The bridge log provides an easy way to filter logs that are
     * published into the zigbee2mqtt/bridge/log MQTT topic.
     * You configure the types you are interested in,
     * and the node creates one output for each type.
     * @param {*} config for the node
     */
    function bridgeLog(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;
        var outputHandler = new OutputHandler();
        utils.setConnectionState(bridgeNode, node);
        // Create a list of log message types to listen to
        var enabledLogTypes = new Array();
        var outputCount = 0;
        Object.keys(config).forEach(function (key) {
            if (key.startsWith("type_") && config[key]) {
                var logType = key.replace("type_", "");
                enabledLogTypes.push(logType);
                outputHandler.addOutput(outputCount, logType, logType, "Logs with the type: " + logType, function (msg) { return msg.message; });
                outputCount++;
            }
        });
        bridgeNode.on("bridge-log", function (message) {
            // Check if the log type is configured
            if (enabledLogTypes.indexOf(message.type) >= 0) {
                var messageForNOutputs = outputHandler.prepareOutput("type", message);
                if (config.consolidate_output) {
                    // If all messages should be consolidated into one output,
                    // use the last element of the array.
                    // Because the output handler sets all the other indexes to null,
                    // nothing is sent to those outputs.
                    messageForNOutputs = messageForNOutputs.slice(-1);
                }
                node.send(messageForNOutputs);
            }
        });
        // Set the node status
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
        });
    }
    RED.nodes.registerType("bridge-log", bridgeLog);
};
