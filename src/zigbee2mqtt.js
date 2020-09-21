module.exports = function(RED) {
    const bavaria = require("node-red-ext-bavaria-black");
    
    function genericLamp(config) {
        RED.nodes.createNode(this,config);
        var bridgeConfig = RED.nodes.getNode(config.bridge);
        var deviceConfig = RED.nodes.getNode(config.device);
        var node = this;

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
    }
    
    RED.nodes.registerType("zigbee2mqtt-bridge-config", bridgeConfig)
    
    function prepareMessages(config){
        RED.nodes.createNode(this,config);
        var node = this;

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
                        element.temperature = msg.payload.override.temperature;
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
                node.send(messages[i]);
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

    RED.nodes.registerType("prepare-messages", prepareMessages);
    
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