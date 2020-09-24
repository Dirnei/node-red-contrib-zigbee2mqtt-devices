module.exports = function(RED) {
    const bavaria = require("node-red-ext-bavaria-black");
    
    function genericLamp(config) {

        RED.nodes.createNode(this,config);
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var deviceConfig = RED.nodes.getNode(config.device);
        var node = this;
        var topic = bridgeConfig.baseTopic + "/" + deviceConfig.deviceName
        bavaria.observer.register(topic, function(msg){
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
                    status = "red";
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

            node.status({fill: status, shape: "dot", text: text});
        });

        node.status({fill: "gray", shape: "dot", text: "pending"});
        node.on('input', function(msg) {
            
            if(msg.payload.devices === undefined)
            {
                msg.payload.devices = [];
            }

            device = {
                topic: bridgeConfig.baseTopic + "/" + deviceConfig.deviceName,
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
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var mqtt = require('mqtt')
        var options = undefined;
        if (bridgeConfig.requireLogin) {
            options = {
                username: bridgeConfig.credentials.username,
                password: bridgeConfig.credentials.password
            };
        }
        
        var client  = mqtt.connect(bridgeConfig.broker, options);
        client.on('connect', function () {
            client.subscribe(bridgeConfig.baseTopic + "/+", function(err){
                if(!err) {
                }
            });
        });

        client.on('message', function(topic, message){
            var message = JSON.parse(message.toString());
            message.topic = topic;
            
            bavaria.observer.notify(topic, message);
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
                    
                //bavaria.observer.notify(message.topic, message.payload);
                client.publish(message.topic + "/set", JSON.stringify(message.payload));

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