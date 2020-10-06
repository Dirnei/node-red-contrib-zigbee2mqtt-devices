module.exports = function (RED) {
    const OutputHandler = require("../lib/outputHandler.js");
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function tintRemote(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;
        var nodeConext = this.context();

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
        });

        function getDirection(msg) {
            var lastTemp = nodeConext.get("lastColorTemp");
            var currentTemp = msg.action_color_temperature;
            nodeConext.set("lastColorTemp", currentTemp)

            if (currentTemp === 150) {
                return "colder";
            } else if (currentTemp >= 370 && (!lastTemp || lastTemp < 370)) {
                return "warmer";
            }

            if (!lastTemp) {
                return "unknown";
            }

            return lastTemp > currentTemp ? "colder" : "warmer";
        }

        function getColorTempStep(msg) {
            var step = config.temperatureChange || 50;
            var direction = getDirection(msg);
            if (direction === "colder") {
                step *= -1;
            } else if (direction === "unknown") {
                step = 0;
            }

            return step;
        }

        var handler = new OutputHandler();
        handler
            .addOutput(0, "power", "on", "pressed", config.suppressPowerpayload ? "toggle" : "on")
            .addOutput(0, "power", "off", "pressed", config.suppressPowerpayload ? "toggle" : "off")
            .addOutput(1, "color", "color_wheel", "pressed", (msg) => {
                return bavaria.converter.xyToRgb(msg.action_color.x, msg.action_color.y);
            })
            .addOutput(2, "temperature", "color_temp", "pressed", (msg) => { return utils.payloads.createColorTempStep(getColorTempStep(msg)) })
            .addOutput(3, "brightness_up", "brightness_up_click", "pressed", utils.payloads.createBrightnessStep(config.brightnessChange))
            .addOutput(3, "brightness_up", "brightness_up_hold", "hold", utils.payloads.createBrightnessMove(config.brightnessChange))
            .addOutput(3, "brightness_up", "brightness_up_release", "released", utils.payloads.createBrightnessMove(0))
            .addOutput(4, "brightness_down", "brightness_down_click", "pressed", utils.payloads.createBrightnessStep(0-config.brightnessChange))
            .addOutput(4, "brightness_down", "brightness_down_hold", "hold", utils.payloads.createBrightnessMove(0-config.brightnessChange))
            .addOutput(4, "brightness_down", "brightness_down_release", "released", utils.payloads.createBrightnessMove(0))
            .addOutput(5, "scene", "scene_3", "pressed", utils.payloads.createSetSceneCommand(0))
            .addOutput(5, "scene", "scene_1", "pressed", utils.payloads.createSetSceneCommand(1))
            .addOutput(5, "scene", "scene_2", "pressed", utils.payloads.createSetSceneCommand(2))
            .addOutput(5, "scene", "scene_6", "pressed", utils.payloads.createSetSceneCommand(3))
            .addOutput(5, "scene", "scene_4", "pressed", utils.payloads.createSetSceneCommand(4))
            .addOutput(5, "scene", "scene_5", "pressed", utils.payloads.createSetSceneCommand(5))

        bridgeNode.subscribeDevice(node.id, config.deviceName, function (msg) {
            try {
                node.send(handler.prepareOutput("action", msg, node));
                node.status({ fill: "green", "text": "Last action: " + msg.action });
                setTimeout(function () {
                    utils.setConnectionState(bridgeNode, node);
                }, 2000);
            } catch (err) {
                node.error(err);
                node.status({ fill: "red", "text": "error" });
            }
        });

        node.on('close', () => {
            bridgeNode.unsubscribe(node.id);
        });
    }
    RED.nodes.registerType("tint-remote", tintRemote);
}