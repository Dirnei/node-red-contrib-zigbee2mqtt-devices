module.exports = function(RED) {
    const bavaria = require("node-red-ext-bavaria-black");

    function sendAt(node, index, msg){
        var output = [];
        for (var i = 0; i < index; i++) {
            output.push(null);
        }
        
        output.push(msg);
        node.send(output);
    }

    function createButtonOutput(output, name, type) {
        return {
            index: output,
            button_name: name,
            button_type: type,
        };
    }

    function ikeaDimmer(config) {
        RED.nodes.createNode(this,config);
        var mqtt = require("mqtt");
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var node = this;
        
        node.status({fill: "blue", text: "not connected"});
        
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
                
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('message', function(topic, message){
            message = JSON.parse(message);
            
            const ioMap = {
                on: createButtonOutput(0, "on", "pressed"),
                off: createButtonOutput(1, "off", "pressed"),
                brightness_up: createButtonOutput(2, "dimm_up", "hold"),
                brightness_down: createButtonOutput(3, "dimm_down", "hold"),
                brightness_stop: createButtonOutput(4, "dimm_stop", "released"),
            };

            var output = ioMap[message.click];
            sendAt(node, output.index, {
                payload: {
                    button_name: output.button_name,
                    button_type: output.button_type,
                }
            });
        });

        client.on('connect', function () {
            node.status({fill: "green", text: "connected"});
            client.subscribe(bridgeConfig.baseTopic + "/" + config.deviceName, function(err){});
        });

    }
    RED.nodes.registerType("ikea-dimmer", ikeaDimmer);
    
    function ikeaRemote(config) {
        RED.nodes.createNode(this,config);
        var mqtt = require("mqtt");
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var node = this;
        
        node.status({fill: "blue", text: "not connected"});
        
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
                
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('message', function(topic, message){
            message = JSON.parse(message);
            const ioMap = {
                toggle: createButtonOutput(0, "toggle", "pressed"),
                toggle_hold: createButtonOutput(0, "toggle", "hold"),
                brightness_up_click: createButtonOutput(1, "brightness_up", "pressed"),
                brightness_up_hold: createButtonOutput(1, "brightness_up", "hold"),
                brightness_up_release: createButtonOutput(1, "brightness_up", "released",),
                brightness_down_click: createButtonOutput(2, "brightness_down", "pressed"),
                brightness_down_hold: createButtonOutput(2, "brightness_down", "hold"),
                brightness_down_release: createButtonOutput(2, "brightness_down", "released"),
                arrow_left_click: createButtonOutput(3, "arrow_left", "pressed"),
                arrow_left_hold: createButtonOutput(3, "arrow_left", "hold"),
                arrow_left_release: createButtonOutput(3, "arrow_left", "released"),
                arrow_right_click: createButtonOutput(4, "arrow_right", "pressed"),
                arrow_right_hold: createButtonOutput(4, "arrow_right", "hold"),
                arrow_right_release: createButtonOutput(4, "arrow_right", "released")
            };

            var output = ioMap[message.action];
            sendAt(node, output.index, {
                payload: {
                    button_name: output.button_name,
                    button_type: output.button_type,
                }
            });
        });

        client.on('connect', function () {
            node.status({fill: "green", text: "connected"});
            client.subscribe(bridgeConfig.baseTopic + "/" + config.deviceName, function(err){});
        });

    }
    RED.nodes.registerType("ikea-remote", ikeaRemote);
    
    function scenicSwitch(config) {
        RED.nodes.createNode(this,config);
        var mqtt = require("mqtt");
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var node = this;
        
        node.status({fill: "blue", text: "not connected"});
        
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
                
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('message', function(topic, message){
            message = JSON.parse(message);
            var inputs = {
                recall_scene_0: createButtonOutput(0, "A0", "pressed"),
                recall_scene_4: createButtonOutput(0, "A0", "released"),
                recall_scene_1: createButtonOutput(1, "A1", "pressed"),
                recall_scene_5: createButtonOutput(1, "A1", "released"),
                recall_scene_3: createButtonOutput(2, "B0", "pressed"),
                recall_scene_7: createButtonOutput(2, "B0", "released"),
                recall_scene_2: createButtonOutput(3, "B1", "pressed"),
                recall_scene_6: createButtonOutput(3, "B1", "released"),
                press_2_of_2: createButtonOutput(4, "UP", "pressed"),
                release_2_of_2: createButtonOutput(4, "UP", "released"),
                press_1_of_2: createButtonOutput(5, "DOWN", "pressed"),
                release_1_of_2: createButtonOutput(5, "DOWN", "released"),
            }

            var output = inputs[message.action];
            sendAt(node, output.index, {
                payload: {
                    button_name: output.button_name,
                    button_type: output.button_type,
                }
            });
        });

        client.on('connect', function () {
            node.status({fill: "green", text: "connected"});
            client.subscribe(bridgeConfig.baseTopic + "/" + config.deviceName, function(err){});
        });

    }
    RED.nodes.registerType("scenic-foh-switch", scenicSwitch);
    
    function buttonSwitch(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        const inputs = {
            pressed: createButtonOutput(0, "", ""),
            hold: createButtonOutput(1, "", ""),
            released: createButtonOutput(2, "", ""),
        }

        node.on('input', function(msg){
            sendAt(node, inputs[msg.payload.button_type].index, msg);
        });
    }
    RED.nodes.registerType("button-switch", buttonSwitch);
    
    function contactSensor(config) {
        RED.nodes.createNode(this,config);
        var mqtt = require("mqtt");
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var node = this;
        
        node.status({fill: "blue", text: "not connected"});
        
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
                
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('message', function(topic, message){
            message = JSON.parse(message);

            if(message.contact) {
                node.send({payload:message});
            } else {
                node.send([null, {payload: message}]);
            }
        });

        client.on('connect', function () {
            node.status({fill: "green", text: "connected"});
            client.subscribe(bridgeConfig.baseTopic + "/" + config.deviceName, function(err){});
        });
    }
    RED.nodes.registerType("contact-sensor", contactSensor);
    
    function occupancySensor(config) {
        RED.nodes.createNode(this,config);
        var mqtt = require("mqtt");
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var node = this;
        
        node.status({fill: "blue", text: "not connected"});
        
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
                
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('message', function(topic, message){
            message = JSON.parse(message);

            if(message.occupancy) {
                node.send({payload:message});
            } else {
                node.send([null, {payload: message}]);
            }
        });

        client.on('connect', function () {
            node.status({fill: "green", text: "connected"});
            client.subscribe(bridgeConfig.baseTopic + "/" + config.deviceName, function(err){});
        });
    }
    RED.nodes.registerType("occupancy-sensor", occupancySensor);

    function genericLamp(config) {

        RED.nodes.createNode(this,config);
        var deviceConfig = RED.nodes.getNode(config.device);
        var node = this;
        var topic = deviceConfig.deviceName

        var nodeContext = this.context().global;
        function getContextName() {
            return ("z2mdevice_"+node.id).replace(".", "_");
        }

        function messageToStatus(msg) {
            var status = "grey";
            var text = "Lm: " + msg.brightness;

            switch(msg.state) {
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

            if(msg.color_temp !== undefined) {
                text += " T: " + msg.color_temp;
            }

            if(msg.color !== undefined)
            {
                var rgb = msg.color;
                if (rgb.x !== undefined) {
                    rgb = bavaria.converter.xyToRgb(msg.color.x, msg.color.y);
                }

                text += " RGB: (" + rgb.r + ", " + rgb.g +", " + rgb.b + ")";
            }
            var status = {fill: status, shape: "dot", text: text};
            nodeContext.set(getContextName(),{
                status: status
            });

            node.status(status);
        }

        bavaria.observer.register(topic, function(msg)
        {
            if(msg.bridgeLogReceived) {
                bavaria.observer.notify("needs_refresh", topic);
                return;
            }

            messageToStatus(msg);
        });
        
        bavaria.observer.register(topic + "_routeError", function(msg)
        {
            var status = {fill: "red", shape: "dot", text: "route error"};
            nodeContext.set(getContextName(),{
                status: status
            });

            node.status(status);
        });

        var status = nodeContext.get(getContextName());
        if (status && status.status) {
            node.status(status.status);
        } else {
            node.status({fill: "gray", shape: "dot", text: "pending"});
        }

        node.on('close', function(){
            nodeContext.set(getContextName(), undefined);
        });

        node.on('input', function(msg) {
            
            if(msg.payload.devices === undefined)
            {
                msg.payload.devices = [];
            }

            device = {
                topic: deviceConfig.deviceName,
                state: config.state,
                delay: config.delay,
            };

            if (deviceConfig.brightnessSupport)
            {
                device.brightness = config.brightness;
                device.transition = config.transition;
            }

            if (deviceConfig.temperatureSupport)
            {
                device.temperature = config.temperature;
            }

            if (deviceConfig.colorSupport)
            {
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
    RED.nodes.registerType("generic-lamp",genericLamp);
    
    function deviceConfig(config) {
        RED.nodes.createNode(this,config);
        this.name   = config.name;
        this.deviceName = config.deviceName;
        this.brightnessSupport = config.brightnessSupport;
        this.temperatureSupport = config.temperatureSupport;
        this.colorSupport = config.colorSupport;
    }
    RED.nodes.registerType("zigbee2mqtt-device-config", deviceConfig)

    function bridgeConfig(config) {
        RED.nodes.createNode(this,config);
        this.name   = config.name;
        this.baseTopic = config.baseTopic;
        this.broker = config.broker;
        this.requireLogin = config.requireLogin;
    }
    RED.nodes.registerType("zigbee2mqtt-bridge-config", bridgeConfig, {
        credentials: {
            username: {type:"text"},
            password: {type:"password"}
        }
    });
    
    function sendMessages(config){
        RED.nodes.createNode(this,config);
        
        var node = this;
        var devicesContextName = "z2m_devices_" + config.bridge.replace(".", "_");
        var knownDevices = [];
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var mqtt = require('mqtt')
        var options = undefined;
        
        var globalContext = this.context().global;

        node.status({fill: "gray", text: "not connected"});
        
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
                
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('message', function(topic, message){
            try {
                if(message.length == 0) {
                    return;
                }

                var message = JSON.parse(message.toString());
                message.topic = topic;

                if (topic == bridgeConfig.baseTopic + "/bridge/log") {
                    if(message.type !== "devices")
                    {
                        switch(message.type) {
                            case "zigbee_publish_error":
                                if (message.message.endsWith("'No network route' (205))'")) {
                                    var name = message.message.substr(0, message.message.indexOf("failed:")-2);
                                    name = name.substr(name.lastIndexOf("'")+1);
                                    bavaria.observer.notify(name + "_routeError", {});
                                }
                                break;
                        }
                        return;
                    }
                    
                    message.message.forEach(element => {
                        if(!knownDevices.some(dev => { return dev.friendly_name == element.friendly_name; })) {
                            knownDevices.push(element);
                            bavaria.observer.notify(element.friendly_name, { bridgeLogReceived: true });
                        }
                    });

                    globalContext.set(devicesContextName, knownDevices);
                    return;
                }

                var deviceName = topic.substr(bridgeConfig.baseTopic.length+1);
                bavaria.observer.notify(deviceName, message);
            }
            catch (err) {
                node.error(err);
            }
        });

        client.on('connect', function () {
            node.status({fill: "green", text: "connected"});

            client.subscribe(bridgeConfig.baseTopic + "/+", function(err){
                if(!err) {
                    client.publish(bridgeConfig.baseTopic + "/bridge/config/devices", "");
                }
            });
            client.subscribe(bridgeConfig.baseTopic + "/bridge/log", function(err){ });
        });

        bavaria.observer.register("needs_refresh", function(msg){
            client.publish(bridgeConfig.baseTopic + "/" + msg + "/get", "");
        });

        node.on('close', function(){
            client.end();
        })
        node.on('input', function(msg) {
            var totalDelay = 0;
            var messages = [];
            msg.payload.devices.forEach(element => {
                if(msg.payload.override !== undefined)
                {
                    if (msg.payload.override.brightness !== undefined 
                        && msg.payload.override.brightness !== ""
                        && element.brightness !== undefined
                        && element.brightness !== "")
                    {
                        element.brightness = msg.payload.override.brightness;
                    }
                    
                    if (msg.payload.override.temperature !== undefined 
                        && msg.payload.override.temperature !== ""
                        && element.temperature !== undefined
                        && element.temperature !== "")
                    {
                        element.temperature = undefined;
                        element.color_temp = msg.payload.override.temperature;
                    }
                    
                    if (msg.payload.override.color !== undefined 
                        && msg.payload.override.color !== ""
                        && element.color !== undefined
                        && element.color !== "")
                    {
                        element.color = msg.payload.override.color;
                    }
                }

                messages.push(element);
            });

            var i = 0;
            enqueue();

            function sendNextMessage()
            {
                var message = {
                    payload: messages[i],
                    topic: messages[i].topic,
                } 
                    
                client.publish(bridgeConfig.baseTopic + "/" + message.topic + "/set", JSON.stringify(message.payload));

                i++;

                if(i<messages.length)
                {
                    enqueue();
                }
            }

            function enqueue()
            {
                var delay = messages[i].delay;
                if (delay > 0)
                {
                    setTimeout(sendNextMessage, delay);
                }
                else
                {
                    sendNextMessage();
                }
            }
        });
    }
    RED.nodes.registerType("send-messages", sendMessages);
    
    function overrideBrightness(config){
        RED.nodes.createNode(this,config);
        var node = this;

        node.on('input', function(msg) {
            if(msg.payload.override === undefined)
            {
                msg.payload.override = {};
            }

            msg.payload.override.brightness = config.brightness;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-brightness", overrideBrightness);
    
    function overrideTemperature(config){
        RED.nodes.createNode(this,config);
        var node = this;

        node.on('input', function(msg) {
            if(msg.payload.override === undefined)
            {
                msg.payload.override = {};
            }

            msg.payload.override.temperature = config.temperature;

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-temperature", overrideTemperature);
    
    function overrideColor(config){
        RED.nodes.createNode(this,config);
        var node = this;

        node.on('input', function(msg) {
            if(msg.payload.override === undefined)
            {
                msg.payload.override = {};
            }

            msg.payload.override.color = {
                r : config.red,
                g : config.green,
                b : config.blue,
            };

            node.send(msg);
        });
    }
    RED.nodes.registerType("override-color", overrideColor);
}