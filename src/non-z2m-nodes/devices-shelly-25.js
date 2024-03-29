module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function createShellyConfig(config) {
        RED.nodes.createNode(this, config);
        this.prefix = config.prefix;
        this.name = config.name;

    }

    RED.nodes.registerType("shelly-config", createShellyConfig);

    function createShelly25(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const broker = RED.nodes.getNode(config.mqtt);
        const shelly = RED.nodes.getNode(config.shelly);

        const context = node.context();
        const status = context.get("status") || { relay: [{ state: "off", energy: 0, power: 0 }, { state: "off", energy: 0, power: 0 }] };
        const channel = parseInt(config.channel);

        let subscribedTopics = [];

        broker.register(node);

        function subscribe(channel) {
            subscribeRaw(node.id, `${shelly.prefix}/relay/${channel}/power`,  (msg) => { setPower(channel, msg); });
            subscribeRaw(node.id, `${shelly.prefix}/relay/${channel}`,        (msg) => { setRelay(channel, msg); });
            subscribeRaw(node.id, `${shelly.prefix}/relay/${channel}/energy`, (msg) => { setEnergy(channel, msg); });
            subscribeRaw(node.id, `${shelly.prefix}/input/${channel}`,        (msg) => { inputReceived(msg, channel); });
        }

        function subscribeRaw(id, topic, callback)
        {
            broker.subscribe(topic, 0, (topic, payload, packet) => {
                callback(payload.toString("utf8"));
            }, id);
            subscribedTopics.push(topic);
        }

        /**
         * Unsubscribe from all topics
         */
        function unsubscribeAll(){
            for(const topic of subscribedTopics){
                broker.unsubscribe(topic, node.id, true);
            }

            subscribedTopics = [];
        }

        if (channel === 2) {
            subscribe(0);
            subscribe(1);
        } else {
            subscribe(channel, 0);
        }

        function inputReceived(msg, channel) {
            msg = {
                payload: msg
            };
            if (config.customPayload === true) {
                const data = config["payloadInput" + channel];
                const type = config["typeInput" + channel];
                msg.payload = utils.ui.input.getPayload(data, type);
            }

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
            if (channel === 2) {
                node.send({ payload: status.relay });
            } else {
                node.send({ payload: status.relay[index] });
            }
        }

        node.on("input", function (msg) {
            function getOutputPayload(msg, channel, state) {
                return utils.payloads.devices.addDevice(msg, {
                    topic: `${shelly.prefix}/relay/${channel}/command`,
                    state: utils.payloads.convertToOnOff(state),
                    target: "mqtt",
                    payloadGenerator: preparePayload
                });
            }

            function getNewState(channel) {
                if (config.state === "toggle") {
                    return status.relay[channel].state == "on" ? "off" : "on";
                }

                return config.state;
            }

            if (channel === 2) {
                msg = getOutputPayload(msg, 0, getNewState(0));
                msg = getOutputPayload(msg, 1, getNewState(1));
            } else {
                msg = getOutputPayload(msg, channel, getNewState(channel));
            }

            node.send(utils.outputs.preapreOutputFor(this.wires.length - 1, msg));
        });

        function preparePayload(data) {
            if (data.state === undefined) {
                data.state = "off";
            }

            return data.state.toLowerCase();
        }

        node.on("close", function () {
            unsubscribeAll();
            broker.deregister(node, ()=>{});
        });
    }

    RED.nodes.registerType("shelly-25", createShelly25);
};