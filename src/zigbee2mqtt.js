module.exports = function (RED) {
    const utils = require("./utils.js");
    const bavaria = utils.bavaria();

    RED.httpAdmin.get('/z2m/devices/:broker/:deviceType/:vendor/:model', function (req, res) {
        try {
            var broker = RED.nodes.getNode(req.params.broker.replace("_", "."));
            var devices = broker.getDeviceList();

            handleDeviceListRequest(devices, req, res);
        } catch (err) {
            console.log(err);
        }
    });

    RED.httpAdmin.get('/z2m/scenes', function (req, res) {
        try {
            var scenes = [];
            RED.nodes.eachNode(n => {
                if (n.type === "scene-in") {
                    if (scenes.every(s => s != n.scene)) {
                        scenes.push(n.scene);
                    }
                }
            });

            res.end(JSON.stringify({
                scenes: scenes
            }));
        } catch (err) {
            console.log(err);
        }
    });

    function handleDeviceListRequest(devices, req, res) {
        var type = req.params.deviceType.toLowerCase();
        var vendor = decodeURI(req.params.vendor).toLowerCase();
        var model = decodeURI(req.params.model).toLowerCase();

        res.end(JSON.stringify({
            devices: devices.filter(e => {
                var dt = e.type.toLowerCase();
                var dv = "all";
                var dm = "all";

                if (e.vendor) {
                    dv = e.vendor.toLowerCase();
                }

                if (e.model) {
                    dm = e.model.toLowerCase();
                }

                return (dt == type || (type == "enddevice" && dt == "greenpower") || (type == "all" && dt !== "coordinator")) &&
                    (dv == vendor || (vendor == "all")) &&
                    (dm == model || (model == "all"));
            })
        }));
    }

    function buttonSwitch(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const inputs = {
            pressed: utils.createButtonOutput(0, "", ""),
            hold: utils.createButtonOutput(1, "", ""),
            released: utils.createButtonOutput(2, "", ""),
            double: utils.createButtonOutput(3, "", ""),
        }

        node.on('input', function (msg) {
            utils.sendAt(node, inputs[msg.payload.button_type].index, msg);
        });
    }
    RED.nodes.registerType("button-switch", buttonSwitch);

    function contactSensor(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });

            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                if (message.contact) {
                    node.send({ payload: message });
                } else {
                    node.send([null, { payload: message }]);
                }
            });
        });
    }
    RED.nodes.registerType("contact-sensor", contactSensor);

    function occupancySensor(config) {
        RED.nodes.createNode(this, config);
        var bridgeNode = RED.nodes.getNode(config.bridge);
        var node = this;

        utils.setConnectionState(bridgeNode, node);
        bavaria.observer.register(bridgeNode.id + "_connected", function (message) {
            node.status({ fill: "green", text: "connected" });

            bridgeNode.subscribeDevice(node.id, config.deviceName, function (message) {
                if (message.occupancy) {
                    node.send({ payload: message });
                } else {
                    node.send([null, { payload: message }]);
                }
            });
        });
    }
    RED.nodes.registerType("occupancy-sensor", occupancySensor);

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
            var status = "grey";
            var text = "Lm: " + msg.brightness;

            switch (msg.state) {
                case "ON":
                case "1":
                case 1:
                case "true":
                case true:
                    status = "green";
                    break;
                case "OFF":
                case "0":
                case 0:
                case "false":
                case false:
                    status = "gray";
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
            var status = { fill: status, shape: "dot", text: text };
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

        bavaria.observer.register(bridgeNode.id + "_connected", function (msg) {
            if (deviceConfig.genericMqttDevice !== true) {
                bridgeNode.refreshDevice(deviceConfig.deviceName);
            }
        });

        if (bridgeNode.isConnected()) {
            if (deviceConfig.genericMqttDevice !== true) {
                bridgeNode.refreshDevice(deviceConfig.deviceName);
            }
        }

        bavaria.observer.register(topic + "_routeError", function (msg) {
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

        node.on('close', function () {
            nodeContext.set(getContextName(), undefined);
            bridgeNode.unsubscribe(node.id);
        });

        node.on('input', function (msg) {

            if (msg.payload.devices === undefined) {
                msg.payload.devices = [];
            }

            device = {
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

        bavaria.observer.register(bridgeNode.id + "_connected", function (msg) {
            node.status({ fill: "green", text: "connected" });
        });

        if (bridgeNode.isConnected()) {
            node.status({ fill: "green", text: "connected" });
        }

        node.on('input', function (msg) {
            var messages = [];
            msg.payload.devices.forEach(element => {
                if (msg.payload.override !== undefined) {
                    if (msg.payload.override.brightness !== undefined
                        && msg.payload.override.brightness !== ""
                        && element.brightness !== undefined
                        && element.brightness !== "") {
                        element.brightness = msg.payload.override.brightness;
                    }

                    if (msg.payload.override.temperature !== undefined
                        && msg.payload.override.temperature !== ""
                        && element.temperature !== undefined
                        && element.temperature !== "") {
                        element.temperature = msg.payload.override.temperature;
                    }

                    if (msg.payload.override.color !== undefined
                        && msg.payload.override.color !== ""
                        && element.color !== undefined
                        && element.color !== "") {
                        element.color = msg.payload.override.color;
                    }
                }

                messages.push(element);
            });

            var i = 0;
            enqueue();

            function sendNextMessage() {
                var topic = messages[i].topic;
                if (messages[i].target === "z2m" || messages[i].target === undefined) {
                    topic = bridgeNode.baseTopic + "/" + messages[i].topic + "/set";
                }

                messages[i].target = undefined;

                var message = {
                    payload: messages[i],
                    topic: topic,
                }

                message.payload.topic = undefined;

                if (message.payload.temperature) {
                    message.payload.color_temp = message.payload.temperature;
                    message.payload.temperature = undefined;
                }

                bridgeNode.publish(message.topic, JSON.stringify(message.payload));

                if (++i < messages.length) {
                    enqueue();
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

    function overrideBrightness(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.brightness = config.brightness;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-brightness", overrideBrightness);

    function overrideTemperature(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.temperature = config.temperature;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-temperature", overrideTemperature);

    function overrideColor(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function (msg) {
            if (msg.payload.override === undefined) {
                msg.payload.override = {};
            }

            msg.payload.override.color = {
                r: config.red,
                g: config.green,
                b: config.blue,
            };

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-color", overrideColor);

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

            node.status({ fill: "green", text: text });
            node.send({ payload: message });
        };

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
                deviceName: deviceNode.name || config.deviceName,
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

        node.on('input', function (msg) {
            enableOutput = true;

            if (deviceNode.genericMqttDevice === true) {
                bridgeNode.publish(deviceNode.refreshTopic, "{}");
            } else {
                bridgeNode.refreshDevice(deviceNode.deviceName);
            }
        });
    }
    RED.nodes.registerType("get-lamp-state", getLampState);
}