const should = require("should");
const helper = require("node-red-node-test-helper");
const mqtt = require("mqtt");
const { Console, log } = require("console");


const requiredNodes = [
    require("../../dist/non-z2m-nodes/devices-shelly-25.js"),
    require("../../dist/zigbee2mqtt-config.js"),
    require("@node-red/nodes/core/common/20-inject.js"),
    require("@node-red/nodes/core/common/21-debug.js"),
    require("@node-red/nodes/core/network/10-mqtt.js"),
];

helper.init(require.resolve("node-red"));
let mqttClient;

const shellyFlowTemplate = [
    {
        "id": "d6c6189e516c5861",
        "type": "tab",
        "label": "Flow 1",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "shelly25terrace",
        "type": "shelly-25",
        "z": "d6c6189e516c5861",
        "name": "Shelly Terrace",
        "mqtt": "mqtt.broker",
        "shelly": "shelly.config",
        "enableInput": true,
        "state": "on",
        "channel": "0",
        "inputs": 1,
        "outputs": 3,
        "customPayload": false,
        "payloadInput0": "",
        "typeInput0": "str",
        "payloadInput1": "",
        "typeInput1": "str",
        "x": 180,
        "y": 80,
        "wires": [
            ["receiver-channel"],
            ["receiver-input"],
            ["receiver-message"]
        ]
    },
    { id: "receiver-channel", type: "helper" },
    { id: "receiver-input", type: "helper" },
    { id: "receiver-message", type: "helper" },
    {
        "id": "mqtt.broker",
        "type": "mqtt-broker",
        "name": "",
        "broker": "127.0.0.1",
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
    },
    {
        "id": "shelly.config",
        "type": "shelly-config",
        "name": "terrace",
        "prefix": "shellies/terrace"
    }
];
const shellyFlowTemplateString = JSON.stringify(shellyFlowTemplate);
let shellyFlow;
let shellyTopic;

function getUniqueFlowForTopic(flowString){
    const deviceName =  Math.floor(Math.random() * 999999).toString();
    const topic = `shellytest/${deviceName}`;
    const newFlow = JSON.parse(flowString);
    const shellyConfig = newFlow.find(node => node.id === "shelly.config");
    shellyConfig.prefix = topic;

    return [newFlow, topic];
}

describe("shelly-25 Node", () => {

    beforeEach((done) => {
        mqttClient  = mqtt.connect("mqtt://localhost:1883");

        [shellyFlow, shellyTopic] = getUniqueFlowForTopic(shellyFlowTemplateString);

        helper.startServer(done);
    });

    afterEach((done) => {
        mqttClient.end(true);

        shellyFlow = null;
        shellyTopic = null;

        helper.unload().then(() => {
            helper.stopServer(done);
        });
    });


    it("should be loaded", (done) => {
        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const shellyNode = helper.getNode("shelly25terrace");
            const mqttNode = helper.getNode("mqtt.broker");

            try {
                shellyNode.should.have.property("name", "Shelly Terrace");
                mqttNode.should.have.property("type", "mqtt-broker");

                await waitBrokerConnect(mqttNode);

                done();
            } catch (err) {
                done(err);
            } finally {
                mqttNode.client.end(true);
            }
        });
    });


    //#region input tests

    it("should forward input changes for channel 0", (done) => {
        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-input");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.should.have.property("payload", "1");

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/input/0`, "1");
        });
    });

    it("should forward input changes for channel 1", (done) => {

        // Modify channel
        shellyFlow[1].channel = 1;

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-input");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.should.have.property("payload", "0");

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/input/1`, "0");
        });
    });

    it("should forward input changes for both channels", (done) => {

        // Modify channel
        shellyFlow[1].channel = 2; // 2 means both inputs

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-input");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            var calledCount = 0;

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    if(calledCount == 0){
                        msg.should.have.property("payload", "0");
                        calledCount++;
                    } else {
                        msg.should.have.property("payload", "1");
                        mqttNode.client.end(true);
                        done();
                    }
                } catch (err) {
                    done(err);
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/input/1`, "0");
            mqttClient.publish(`${shellyTopic}/input/0`, "1");
        });
    });

    it("should forward input changes with custom payload for both channels", (done) => {

        // Modify channel
        shellyFlow[1].channel = 2; // 2 means both inputs
        shellyFlow[1].customPayload = true;
        shellyFlow[1].payloadInput0 = "Input zero was triggered";
        shellyFlow[1].payloadInput1 = "Input one was triggered";


        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-input");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            let calledCount = 0;

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    if(calledCount == 0){
                        msg.should.have.property("payload", "Input one was triggered");
                        calledCount++;
                    } else
                    {
                        msg.should.have.property("payload", "Input zero was triggered");
                        mqttNode.client.end(true);
                        done();
                    }
                } catch (err) {
                    done(err);
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/input/1`, "0");
            mqttClient.publish(`${shellyTopic}/input/0`, "1");
        });
    });

    it("should not forward input changes for other unsubscribed channel", (done) => {

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNodes = [
                helper.getNode("receiver-channel"),
                helper.getNode("receiver-input"),
                helper.getNode("receiver-message")
            ];
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            //Assert
            let received = false;

            // Expect no output produced
            setTimeout(() => {
                if(!received){
                    done();
                }
                mqttNode.client.end(true);
            }, 50);

            // Fail if any output is produced
            receiverNodes.forEach(node =>{
                node.on("input", msg => {
                    received = true;
                    mqttNode.client.end(true);
                    done(new Error(`Message was not expected: ${JSON.stringify(msg)} topic: ${shellyTopic}`));
                });
            });

            // Act
            mqttClient.publish(`${shellyTopic}/input/1`, "1");
        });
    });

    //endregion


    //#region relay tests

    it("should forward relay changes for channel 0", (done) => {
        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-channel");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.should.have.property("payload", { state: "on", energy: 0, power: 0 });

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/relay/0`, "on");
        });
    });

    it("should forward relay changes for channel 1", (done) => {

        // Modify channel
        shellyFlow[1].channel = 1;

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-channel");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.should.have.property("payload", { state: "off", energy: 0, power: 0 });

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/relay/1`, "off");
        });
    });

    it("should forward relay changes for both channels", (done) => {

        // Modify channel
        shellyFlow[1].channel = 2; // 2 means both inputs

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-channel");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            var calledCount = 0;

            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    if(calledCount == 0){
                        msg.should.have.property("payload",
                            [
                                { state: "off", energy: 0, power: 0 },
                                { state: "off", energy: 0, power: 0 }
                            ]);
                        calledCount++;
                    } else {
                        msg.should.have.property("payload",
                            [
                                { state: "on", energy: 0, power: 0 },
                                { state: "off", energy: 0, power: 0 }
                            ]);
                        mqttNode.client.end(true);
                        done();
                    }
                } catch (err) {
                    done(err);
                    mqttNode.client.end(true);
                }
            });

            // Act
            mqttClient.publish(`${shellyTopic}/relay/1`, "off");
            setTimeout(() => mqttClient.publish(`${shellyTopic}/relay/0`, "on"), 50);
        });
    });

    it("should not forward relay changes for other unsubscribed channel", (done) => {

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNodes = [
                helper.getNode("receiver-channel"),
                helper.getNode("receiver-input"),
                helper.getNode("receiver-message")
            ];
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            //Assert
            let received = false;

            // Expect no output produced
            setTimeout(() => {
                if(!received){
                    done();
                }
                mqttNode.client.end(true);
            }, 50);

            // Fail if any output is produced
            receiverNodes.forEach(node =>{
                node.on("input", msg => {
                    received = true;
                    mqttNode.client.end(true);
                    done(new Error(`Message was not expected: ${JSON.stringify(msg)} topic: ${shellyTopic}`));
                });
            });

            // Act
            mqttClient.publish(`${shellyTopic}/relay/1`, "1");
        });
    });

    //endregion


    //#region control relay tests

    it("should send relay payload for channel 0 on input", (done) => {

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-message");
            const shellyNode = helper.getNode("shelly25terrace");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            //Assert
            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.payload.devices.should.have.length(1);
                    const device = msg.payload.devices[0];
                    device.should.have.property("topic", `${shellyTopic}/relay/0/command`);
                    device.should.have.property("state", "ON");
                    device.should.have.property("target", "mqtt");

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            shellyNode.receive({payload: "something"});
        });
    });

    it("should send relay payload for channel 1 on input", (done) => {
        // Modify flow
        shellyFlow[1].channel = 1;

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-message");
            const shellyNode = helper.getNode("shelly25terrace");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            //Assert
            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.payload.devices.should.have.length(1);
                    const device = msg.payload.devices[0];
                    device.should.have.property("topic", `${shellyTopic}/relay/1/command`);
                    device.should.have.property("state", "ON");
                    device.should.have.property("target", "mqtt");

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            shellyNode.receive({payload: "foo", topic: "bar"});
        });
    });

    it("should send relay payload for both channels on input", (done) => {
        // Modify flow
        shellyFlow[1].channel = 2; //2 means both
        shellyFlow[1].state = "off";

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-message");
            const shellyNode = helper.getNode("shelly25terrace");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);
            let receivedCount = 0;

            //Assert
            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.payload.devices.should.have.length(2);

                    const validateDevice = (device, channel) => {
                        device.should.have.property("topic", `${shellyTopic}/relay/${channel}/command`);
                        device.should.have.property("state", "OFF");
                        device.should.have.property("target", "mqtt");
                    };
                    validateDevice(msg.payload.devices[0], 0);
                    validateDevice(msg.payload.devices[1], 1);

                    receivedCount++;
                    if(receivedCount >= 3) {
                        done();
                    }
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            shellyNode.receive({payload: "foo", topic: "bar"});
            shellyNode.receive({payload: "foo", topic: "bar"});
            shellyNode.receive({payload: "foo", topic: "bar"});
        });
    });

    it("should toggle relay payload for both channels on input", (done) => {
        // Modify flow
        shellyFlow[1].channel = 2; //2 means both
        shellyFlow[1].state = "toggle";

        helper.load(requiredNodes, shellyFlow, async () => {
            // Arrange
            const receiverNode = helper.getNode("receiver-message");
            const shellyNode = helper.getNode("shelly25terrace");
            const mqttNode = helper.getNode("mqtt.broker");

            await waitBrokerConnect(mqttNode);

            //Assert
            receiverNode.on("input", function (msg) {
                try {
                    // Assert
                    msg.payload.devices.should.have.length(2);

                    const validateDevice = (device, channel) => {
                        device.should.have.property("topic", `${shellyTopic}/relay/${channel}/command`);
                        device.should.have.property("state", "ON");
                        device.should.have.property("target", "mqtt");
                    };
                    validateDevice(msg.payload.devices[0], 0);
                    validateDevice(msg.payload.devices[1], 1);

                    done();
                } catch (err) {
                    done(err);
                } finally {
                    mqttNode.client.end(true);
                }
            });

            // Act
            shellyNode.receive({payload: "foo", topic: "bar"});
        });
    });

    //endregion

    // src: https://github.com/node-red/node-red/blob/946def022fa94e9998d5c6095838841a1c94e2da/test/nodes/core/network/21-mqtt_spec.js#L854
    function waitBrokerConnect(broker, timeLimit) {

        let waitConnected = (broker, timeLimit) => {
            const brokers = Array.isArray(broker) ? broker : [broker];
            timeLimit = timeLimit || 1000;
            return new Promise( (resolve, reject) => {
                let timer, resolved = false;
                timer = wait();
                function wait() {
                    if (brokers.every(e => e.connected == true)) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve();
                    } else {
                        timeLimit = timeLimit - 15;
                        if (timeLimit <= 0) {
                            if(!resolved) {
                                reject("Timeout waiting broker connect");
                            }
                        }
                        timer = setTimeout(wait, 15);
                        return timer;
                    }
                }
            });
        };
        return waitConnected(broker, timeLimit);
    }
});