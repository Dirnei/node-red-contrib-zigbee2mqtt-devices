const should = require("should");
const helper = require("node-red-node-test-helper");
const requiredNodes = [
    require("../dist/zigbee2mqtt.js"),
    require("../dist/zigbee2mqtt-config.js"),
    require("@node-red/nodes/core/common/20-inject.js"),
    require("@node-red/nodes/core/common/21-debug.js"),
    require("@node-red/nodes/core/network/10-mqtt.js"),
];

helper.init(require.resolve("node-red"));

describe("generic-lamp Node", function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it("should be loaded", function (done) {
        var flow = [
            {
                "id": "caa96857ce2cb799",
                "type": "generic-lamp",
                "z": "b46cd66b87ed23ae",
                "device": "7716bf2cc109979b",
                "name": "Ikea test lamp",
                "state": "ON",
                "brightness": 0,
                "temperature": 50,
                "red": 0,
                "green": 0,
                "blue": 0,
                "transition": 2,
                "delay": 0,
                "x": 480,
                "y": 160,
                "wires": [
                    [
                        "fd3fb7b09d9d0524"
                    ]
                ]
            },
            {
                "id": "fd3fb7b09d9d0524",
                "type": "debug",
                "z": "b46cd66b87ed23ae",
                "name": "",
                "active": true,
                "tosidebar": true,
                "console": false,
                "tostatus": false,
                "complete": "false",
                "statusVal": "",
                "statusType": "auto",
                "x": 690,
                "y": 160,
                "wires": []
            },
            {
                "id": "ec3f8c76406956ef",
                "type": "inject",
                "z": "b46cd66b87ed23ae",
                "name": "",
                "props": [
                    {
                        "p": "payload"
                    },
                    {
                        "p": "topic",
                        "vt": "str"
                    }
                ],
                "repeat": "",
                "crontab": "",
                "once": false,
                "onceDelay": 0.1,
                "topic": "",
                "payload": "",
                "payloadType": "date",
                "x": 280,
                "y": 160,
                "wires": [
                    [
                        "caa96857ce2cb799"
                    ]
                ]
            },
            {
                "id": "7716bf2cc109979b",
                "type": "zigbee2mqtt-device-config",
                "name": "Ikea test lamp",
                "bridge": "f8ba4931243895a8",
                "deviceName": "Ikea Test Lamp",
                "brightnessSupport": false,
                "temperatureSupport": false,
                "colorSupport": false,
                "genericMqttDevice": false,
                "statusTopic": "",
                "commandTopic": "",
                "refreshTopic": ""
            },
            {
                "id": "f8ba4931243895a8",
                "type": "zigbee2mqtt-bridge-config",
                "name": "z2m2",
                "broker": "eb1b1a7d89c241b8",
                "baseTopic": "zigbee2mqtt",
                "enabledLogging": false,
                "allowDeviceStatusRefresh": true
            },
            {
                "id": "eb1b1a7d89c241b8",
                "type": "mqtt-broker",
                "name": "mosquitto",
                "broker": "192.168.178.49",
                "port": "1883",
                "clientid": "",
                "autoConnect": true,
                "usetls": false,
                "protocolVersion": "4",
                "keepalive": "60",
                "cleansession": true,
                "birthTopic": "",
                "birthQos": "0",
                "birthPayload": "",
                "birthMsg": {},
                "closeTopic": "",
                "closeQos": "0",
                "closePayload": "",
                "closeMsg": {},
                "willTopic": "",
                "willQos": "0",
                "willPayload": "",
                "willMsg": {},
                "sessionExpiry": ""
            }
        ];
        helper.load(requiredNodes, flow, function () {
            var n1 = helper.getNode("caa96857ce2cb799");
            try {
                n1.should.have.property("name", "Ikea test lamp");
                done();
            } catch (err) {
                done(err);
            }
        });
    });


});