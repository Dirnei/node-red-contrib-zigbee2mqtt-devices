module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function createEurotronicsSpirit(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
        });

        node.on("close", function () {
        });
    }

    RED.nodes.registerType("devices-eurotronics", createEurotronicsSpirit);
};
