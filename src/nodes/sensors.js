/* eslint-disable quotes */
module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function contactSensor(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        let regId = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });

            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                if (message.contact) {
                    node.send({ payload: message });
                } else {
                    node.send([null, { payload: message }]);
                }
            });
        });

        node.on("close", ()=>{
            bavaria.observer.unregister(regId);
        });
    }
    RED.nodes.registerType("contact-sensor", contactSensor);

    function occupancySensor(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        let regId = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });

            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                if (message.occupancy) {
                    node.send({ payload: message });
                } else {
                    node.send([null, { payload: message }]);
                }
            });
        });

        node.on("close", ()=>{
            bavaria.observer.unregister(regId);
        });
    }
    RED.nodes.registerType("occupancy-sensor", occupancySensor);

    function climateSensor(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;
        utils.setConnectionState(bridgeNode, node);

        function messageReceived(message) {
            var text = "";
            if (config.temperature === true) {
                text += "T: " + message.temperature + "C° ";
            }

            if (config.pressure === true) {
                text += "P: " + message.pressure + "mBar ";
            }

            if (config.humidity === true) {
                text += "H: " + message.humidity + "%";
            }

            if (config.co2 === true) {
                text += "CO2: " + message.co2 + "ppm";
            }

            node.status({ fill: "green", text: text });
            node.send({ payload: message });
        }

        function subscribe() {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, messageReceived);
        }

        if (bridgeNode.isConnected() === true) {
            subscribe();
        }

        var observerId = bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            subscribe();
        });

        node.on('close', function () {
            bridgeNode.unsubscribe(node.id);
            bavaria.observer.unregister(observerId);
        });
    }
    RED.nodes.registerType("climate-sensor", climateSensor);
};