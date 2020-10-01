module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    function tintRemote(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });
            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                try {
                    const ioMap = {
                        on: utils.createButtonOutput(0, "power", "pressed", "on"),
                        off: utils.createButtonOutput(0, "power", "pressed", "off"),
                        color_wheel: utils.createButtonOutput(1, "color", "pressed", message.action_color),
                        color_temp: utils.createButtonOutput(2, "temperature", "pressed", message.action_color_temperature),
                        brightness_up_click: utils.createButtonOutput(3, "brightness_up", "pressed"),
                        brightness_up_hold: utils.createButtonOutput(3, "brightness_up", "hold"),
                        brightness_up_release: utils.createButtonOutput(3, "brightness_up", "released"),
                        brightness_down_click: utils.createButtonOutput(4, "brightness_down", "pressed"),
                        brightness_down_hold: utils.createButtonOutput(4, "brightness_down", "hold"),
                        brightness_down_release: utils.createButtonOutput(4, "brightness_down", "released"),
                        scene_3: utils.createButtonOutput(5, "scene", "pressed", 0),
                        scene_1: utils.createButtonOutput(5, "scene", "pressed", 1),
                        scene_2: utils.createButtonOutput(5, "scene", "pressed", 2),
                        scene_6: utils.createButtonOutput(5, "scene", "pressed", 3),
                        scene_4: utils.createButtonOutput(5, "scene", "pressed", 4),
                        scene_5: utils.createButtonOutput(5, "scene", "pressed", 5),
                    };

                    var output = ioMap[message.action];
                    var msg = {
                        remoteControl: {
                            button_name: output.button_name,
                            button_type: output.button_type,
                            button_payload: output.button_payload,
                            action_group: message.action_group
                        }
                    };

                    switch (output.button_name) {
                        case "scene":
                            msg.command = "set";
                            msg.scene = output.button_payload;
                            break;
                        case "color":
                            msg.payload = {
                                override: {
                                    color: output.button_payload
                                }
                            }
                            break;
                        case "temperature":
                            msg.payload = {
                                override: {
                                    action: {
                                        name: "color_temp_step",
                                        value: 50
                                    }
                                }
                            }
                            break;
                        case "brightness_up":
                            if (output.button_type == "pressed") {
                                msg.payload = {
                                    override: {
                                        action: {
                                            name: "brightness_step",
                                            value: 50
                                        }
                                    }
                                }
                            }
                            break;
                        case "brightness_down":
                            if (output.button_type == "pressed") {
                                msg.payload = {
                                    override: {
                                        action: {
                                            name: "brightness_step",
                                            value: -50
                                        }
                                    }
                                }
                            }
                            break;
                    }

                    utils.sendAt(node, output.index, msg);
                    node.status({ fill: "green", "text": "Last action: " + output.button_type });
                    setTimeout(function () {
                        node.status({ fill: "green", text: "connected" });
                    }, 2000);
                } catch (err) {
                    node.error(err);
                    node.status({ fill: "red", "text": "error" });
                }
            });
        });

    }
    RED.nodes.registerType("tint-remote", tintRemote);
}