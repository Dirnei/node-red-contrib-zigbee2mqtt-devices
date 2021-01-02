/* eslint-disable no-unused-vars */
/* eslint-disable indent */
module.exports = function (RED) {
    const utils = require("./lib/utils.js");
    const bavaria = utils.bavaria();

    function genericLamp(config) {
        RED.nodes.createNode(this, config);
        var deviceConfig = RED.nodes.getNode(config.device);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;
        var topic = deviceConfig.deviceName;

        var nodeContext = this.context().global;
        function getContextName() {
            return ("z2mdevice_" + node.id).replace(".", "_");
        }

        function messageToStatus(msg) {
            var statusColor = "grey";
            var text = "Lm: " + msg.brightness;

            switch (msg.state) {
                case "ON":
                case "1":
                case 1:
                case "true":
                case true:
                    statusColor = "green";
                    break;
                case "OFF":
                case "0":
                case 0:
                case "false":
                case false:
                    statusColor = "gray";
                    break;
            }

            if (msg.color_temp !== undefined) {
                text += " T: " + msg.color_temp;
            }

            if (msg.color !== undefined) {
                var rgb = msg.color;
                if (rgb.x !== undefined) {
                    rgb = bavaria.converter.xyToRgb(msg.color.x, msg.color.y);
                }

                text += " RGB: (" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
            }
            var status = { fill: statusColor, shape: "dot", text: text };
            nodeContext.set(getContextName(), {
                status: status
            });

            node.status(status);
        }

        if (deviceConfig.genericMqttDevice !== true) {
            bridgeNode.subscribeDevice(node.id, deviceConfig.deviceName, function (msg) {
                messageToStatus(msg);
            });
        }

        bavaria.observer.register(bridgeNode.id + "_connected", function (_msg) {
            if (deviceConfig.genericMqttDevice !== true) {
                bridgeNode.refreshDevice(deviceConfig.deviceName);
            }
        });

        if (bridgeNode.isConnected()) {
            if (deviceConfig.genericMqttDevice !== true) {
                bridgeNode.refreshDevice(deviceConfig.deviceName);
            }
        }

        bavaria.observer.register(topic + "_routeError", function (_msg) {
            var status = { fill: "red", shape: "dot", text: "route error" };
            nodeContext.set(getContextName(), {
                status: status
            });

            node.status(status);
        });

        var status = nodeContext.get(getContextName());
        if (status && status.status) {
            node.status(status.status);
        } else if (deviceConfig.genericMqttDevice !== true) {
            node.status({ fill: "gray", shape: "dot", text: "pending" });
        }

        node.on("close", function () {
            nodeContext.set(getContextName(), undefined);
            bridgeNode.unsubscribe(node.id);
        });

        node.on("input", function (msg) {
            if (msg.payload === undefined || typeof msg.payload != "object") {
                msg.payload = {};
            }

            if (msg.payload.devices === undefined) {
                msg.payload.devices = [];
            }

            var device = {
                topic: deviceConfig.genericMqttDevice ? deviceConfig.commandTopic : deviceConfig.deviceName,
                state: config.state,
                delay: config.delay,
                target: deviceConfig.genericMqttDevice ? "mqtt" : "z2m"
            };

            if (deviceConfig.brightnessSupport) {
                device.brightness = config.brightness;
                device.transition = config.transition;
            }

            if (deviceConfig.temperatureSupport) {
                device.temperature = config.temperature;
            }

            if (deviceConfig.colorSupport) {
                device.color = {
                    r: config.red,
                    g: config.green,
                    b: config.blue
                };
            }

            msg.payload.devices.push(device);

            node.send(msg);
        });
    }
    RED.nodes.registerType("generic-lamp", genericLamp);

    function sendMessages(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var bridgeNode = RED.nodes.getNode(config.bridge);

        if (!bridgeNode) {
            node.status({ fill: "red", text: "no bridge configured" });
            return;
        }
        node.status({ fill: "blue", text: "not connected" });

        bavaria.observer.register(bridgeNode.id + "_connected", function (_msg) {
            node.status({ fill: "green", text: "connected" });
        });

        if (bridgeNode.isConnected()) {
            node.status({ fill: "green", text: "connected" });
        }

        node.on("input", function (msg) {
            var messages = [];
            msg.payload.devices.forEach(element => {
                if (msg.payload.override !== undefined) {
                    if (msg.payload.override.action) {
                        element.brightness = undefined;
                        element.temperature = undefined;
                        element.color = undefined;
                        element.delay = undefined;
                        element.transition = undefined;
                        element.state = undefined;
                        element[msg.payload.override.action.name] = msg.payload.override.action.value;
                    } else {
                        const properties = ["state", "brightness", "temperature", "color"];
                        properties.forEach((name) => {
                            if (utils.propertyExists(msg.payload.override, name)
                                && utils.propertyExists(element, name)) {
                                element[name] = msg.payload.override[name];
                            }
                        });
                    }
                }

                messages.push(element);
            });

            var i = 0;
            enqueue();

            function sendNextMessage() {
                try {
                    var topic = messages[i].topic;

                    if (messages[i].target === "z2m" || messages[i].target === undefined) {
                        topic = bridgeNode.baseTopic + "/" + messages[i].topic + "/set";
                    }

                    messages[i].target = undefined;
                    messages[i].delay = undefined;

                    var message = {
                        payload: messages[i],
                        topic: topic,
                    };

                    message.payload.topic = undefined;

                    if (message.payload.temperature) {
                        message.payload.color_temp = message.payload.temperature;
                        message.payload.temperature = undefined;
                    }

                    if (message.payload.transition === 0 || message.payload.transition === "0") {
                        message.payload.transition = undefined;
                    }

                    try {
                        if (message.payload.payloadGenerator && typeof message.payload.payloadGenerator === "function") {
                            message.payload = message.payload.payloadGenerator(message.payload);
                        } else {
                            message.payload = JSON.stringify(message.payload);
                        }

                        bridgeNode.publish(message.topic, message.payload);
                    } catch (err) {
                        node.error(err);
                    }

                    if (++i < messages.length) {
                        enqueue();
                    }
                }
                catch (err) {
                    node.error(err);
                }
            }

            function enqueue() {
                var delay = messages[i].delay;
                if (delay > 0) {
                    setTimeout(sendNextMessage, delay);
                }
                else {
                    sendNextMessage();
                }
            }
        });
    }
    RED.nodes.registerType("send-messages", sendMessages);

    function buttonSwitch(config) {
        RED.nodes.createNode(this, config);
        var isHolding = false;
        var currentCount = 0;

        var node = this;

        var inputs = {};
        const types = ["Pressed", "Hold", "Released", "Double"];
        var currentIndex = 0;
        types.forEach(type => {
            if (config["enable" + type]) {
                inputs[type.toLowerCase()] = utils.createButtonOutput(currentIndex, "", "");
                currentIndex++;
            }
        });

        function getPayload(data, type) {
            try {
                switch (type) {
                    case "num":
                        return Number.parseFloat(data);
                    case "bool":
                        return data == true;
                    case "json":
                        return JSON.parse(data);
                }
            } catch (err) {
                node.error(err);
            }

            return data;
        }

        node.on("input", function (msg) {
            var actionName = msg.payload.button_type;
            if (actionName === undefined && msg.action !== undefined) {
                actionName = msg.action.description;
            }

            if (actionName === "released") {
                isHolding = false;
            }

            if (config.dynamicOutputLabels.every(e => e.toLowerCase() != actionName)) {
                // output not enabled
                return;
            }

            var index = inputs[actionName].index;
            actionName = actionName.charAt(0).toUpperCase() + actionName.slice(1);

            if (config["customPayload" + actionName] === true) {
                msg = { payload: getPayload(config["payload" + actionName], config["type" + actionName]) };
            }

            if (actionName === "Hold" && config.repeatHold) {
                currentCount = 0;
                isHolding = true;
                repeateMessage();
            } else {
                utils.sendAt(node, index, msg);
            }

            function repeateMessage() {
                if (isHolding && currentCount < config.repeatHoldMax) {
                    currentCount++;
                    utils.sendAt(node, index, msg);
                    setTimeout(repeateMessage, config.repeatHoldDelay);
                } else {
                    isHolding = false;
                }
            }
        });
    }
    RED.nodes.registerType("button-switch", buttonSwitch);

    function deviceStatus(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var deviceNode = RED.nodes.getNode(config.device);

        if (config.genericMqttDevice === true) {
            bridgeNode.subscribe(node.id, deviceNode.statusTopic, subscriptionCallback);
        } else {
            bridgeNode.subscribeDevice(node.id, config.deviceName, subscriptionCallback);
        }

        function subscriptionCallback(msg) {
            node.send({
                device: config.genericMqttDevice === true ? deviceNode.statusTopic : config.deviceName,
                deviceName: config.genericMqttDevice === true ? deviceNode.name : undefined,
                payload: msg,
            });
        }
    }
    RED.nodes.registerType("device-status", deviceStatus);

    function getLampState(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var deviceNode = RED.nodes.getNode(config.device);

        var enableOutput = false;
        if (deviceNode.genericMqttDevice === true) {
            bridgeNode.subscribe(node.id, deviceNode.statusTopic, subscriptionCallback);
        } else {
            bridgeNode.subscribeDevice(node.id, deviceNode.deviceName, subscriptionCallback);
        }

        function subscriptionCallback(msg) {
            if (enableOutput === true) {
                enableOutput = false;
                node.send({
                    device: deviceNode.genericMqttDevice === true ? deviceNode.statusTopic : deviceNode.deviceName,
                    deviceName: deviceNode.name,
                    payload: msg,
                });
            }
        }

        node.on("input", function (msg) {
            enableOutput = true;

            if (deviceNode.genericMqttDevice === true) {
                bridgeNode.publish(deviceNode.refreshTopic, "{}");
            } else {
                bridgeNode.refreshDevice(deviceNode.deviceName);
            }
        });
    }
    RED.nodes.registerType("get-lamp-state", getLampState);
};