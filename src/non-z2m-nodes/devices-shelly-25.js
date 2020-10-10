module.exports = function (RED) {
    const utils = require("../../lib/utils.js");
    const bavaria = utils.bavaria();

    function createShelly25(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var broker = RED.nodes.getNode(config.mqtt);
        var context = node.context();
        var status = context.get("status") || { relay: [{ state: "off", energy: 0, power: 0 }, { state: "off", energy: 0, power: 0 }] };

        broker.subscribe(node.id, config.prefix + "/relay/0", (msg) => { setRelay(0, msg); });
        broker.subscribe(node.id + 1, config.prefix + "/relay/0/power", (msg) => { setPower(0, msg); });
        broker.subscribe(node.id + 2, config.prefix + "/relay/0/energy", (msg) => { setEnergy(0, msg); });
        broker.subscribe(node.id + 3, config.prefix + "/relay/1", (msg) => { setRelay(1, msg); });
        broker.subscribe(node.id + 4, config.prefix + "/relay/1/power", (msg) => { setPower(1, msg); });
        broker.subscribe(node.id + 5, config.prefix + "/relay/1/energy", (msg) => { setEnergy(1, msg); });

        broker.subscribe(node.id + 6, config.prefix + "/input/0", (msg) => { inputReceived(0, msg); });
        broker.subscribe(node.id + 7, config.prefix + "/input/1", (msg) => { inputReceived(1, msg); });

        function inputReceived(index, msg) {
            node.warn("input/" + index);
            node.send(utils.outputs.preapreOutputFor(index + (config.condensedOutput == true ? 1 : 2), msg));
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
            if (config.condensedOutput === true) {
                node.send({ payload: status });
            } else {
                var states = [];
                for (var i = 0; i < index; i++) {
                    states.push(null);
                }

                states.push({
                    paload: status.relay[index]
                });

                node.send(states);
            }
        }

        node.on("input", function (msg) {
            
            msg = utils.payloads.devices.addDevice(msg, {
                topic: config.prefix + "/relay/0",
                state: "on",
                target: "mqtt"
            });

            msg = utils.payloads.devices.addDevice(msg, {
                topic: config.prefix + "/relay/1",
                state: "on",
                target: "mqtt"
            });

            node.warn(config);
            node.send(utils.outputs.preapreOutputFor(this.wires.length - 1, msg));
        });

        node.on("close", function () {

        });
    }

    RED.nodes.registerType("shelly-25", createShelly25);
};