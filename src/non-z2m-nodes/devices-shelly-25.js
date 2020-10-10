module.exports = function (RED) {
    const utils = require("../../lib/utils.js");
    const bavaria = utils.bavaria();

    function createShellyConfig(config) {
        RED.nodes.createNode(this, config);
        this.prefix = config.prefix;
        this.name = config.name;

    }

    RED.nodes.registerType("shelly-config", createShellyConfig);

    function createShelly25(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var broker = RED.nodes.getNode(config.mqtt);
        var shelly = RED.nodes.getNode(config.shelly);

        var context = node.context();
        var status = context.get("status") || { relay: [{ state: "off", energy: 0, power: 0 }, { state: "off", energy: 0, power: 0 }] };
        var channel = parseInt(config.channel);
        node.warn(channel);

        broker.subscribe(node.id, shelly.prefix + "/relay/" + channel, (msg) => { setRelay(channel, msg); });
        broker.subscribe(node.id + 1, shelly.prefix + "/relay/" + channel + "/power", (msg) => { setPower(channel, msg); });
        broker.subscribe(node.id + 2, shelly.prefix + "/relay/" + channel + "/energy", (msg) => { setEnergy(channel, msg); });
        broker.subscribe(node.id + 2, shelly.prefix + "/input/" + channel, (msg) => { inputReceived(msg); });

        function inputReceived(msg) {
            node.send(utils.outputs.preapreOutputFor(1, msg));
        }

        function setRelay(index, value) {
            status.relay[index].state = value;
            setStatus(status, index);
        }

        function setEnergy(index, value) {
            status.relay[index].energy = value;
            setStatus(status, index);
        }

        function setPower(index, value) {
            status.relay[index].power = value;
            setStatus(status, index);
        }

        function setStatus(status, index) {
            context.set("status", status);
            publishState(index);
        }

        function publishState(index) {
            node.send({
                paload: status.relay[index]
            });
        }

        node.on("input", function (msg) {
            var state = config.state;
            if (config.state === "toggle") {
                state = status.relay[channel].state == "on" ? "off" : "on";
            }

            msg = utils.payloads.devices.addDevice(msg, {
                topic: shelly.prefix + "/relay/" + channel + "/command",
                state: state,
                target: "mqtt",
                payloadGenerator: preparePayload
            });

            node.send(utils.outputs.preapreOutputFor(this.wires.length - 1, msg));
        });

        function preparePayload(data) {
            return data.state || "off";
        }

        node.on("close", function () {

        });
    }

    RED.nodes.registerType("shelly-25", createShelly25);
};