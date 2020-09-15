module.exports = function(RED) {
    
    function genericLamp(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }

    RED.nodes.registerType("generic-lamp",genericLamp);
    
    function deviceConfig(config) {
        RED.nodes.createNode(this,config);
        this.name   = config.name;
        this.deviceName = config.deviceName;
        this.model = config.model;
    }
    
    RED.nodes.registerType("zigbee2mqtt-device-config", deviceConfig)

    function bridgeConfig(config) {
        RED.nodes.createNode(this,config);
        this.name   = config.name;
        this.baseTopic = config.baseTopic;
    }
    
    RED.nodes.registerType("zigbee2mqtt-bridge-config", bridgeConfig)
}