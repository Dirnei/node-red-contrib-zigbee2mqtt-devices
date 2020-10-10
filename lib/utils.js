
function setConnectionState(bridgeNode, node) {
    if (bridgeNode.isConnected() === true) {
        node.status({ fill: "green", text: "connected" });
    } else {
        node.status({ fill: "blue", text: "not connected" });
    }
}

function createButtonOutput(output, name, type, payload) {
    return {
        index: output,
        button_name: name,
        button_type: type,
        button_payload: payload,
    };
}

function sendAt(node, index, msg) {
    var output = [];
    for (var i = 0; i < index; i++) {
        output.push(null);
    }

    output.push(msg);
    node.send(output);
}
function createAction(property, type, value) {
    return {
        payload: {
            override: {
                action: {
                    name: `${property}_${type}`,
                    value: value
                }
            }
        }
    };
}

function createSceneCommand(command, value) {
    return {
        command: command,
        scene: value
    };
}

function createOverride(name, value) {
    var override = {};
    override[name] = value;
    return override;
}

const bavaria = require("node-red-ext-bavaria-black");

module.exports = {
    createButtonOutput: createButtonOutput,
    bavaria: () => bavaria,
    sendAt: sendAt,
    setConnectionState: setConnectionState,
    payloads: {
        createColorTempStep: (value) => { return createAction("color_temp", "step", value); },
        createColorTempMove: (value) => { return createAction("color_temp", "move", value == 0 ? "stop" : value); },

        createBrightnessStep: (value) => { return createAction("brightness", "step", value); },
        createBrightnessMove: (value) => { return createAction("brightness", "move", value); },

        createHueStep: (value) => { return createAction("hue", "step", value); },
        createHueMove: (value) => { return createAction("hue", "move", value); },

        createSaturationStep: (value) => { return createAction("saturation", "step", value); },
        createSaturationMove: (value) => { return createAction("saturation", "move", value); },
        createNextSceneCommand: () => { return createSceneCommand("next", undefined); },
        createPreviousSceneCommand: () => { return createSceneCommand("previous", undefined); },
        createSetSceneCommand: (value) => { return createSceneCommand("set", value); },
        overrides: {
            createStateOverride: (value) => { return createOverride("state", value); },
        },
        devices: {
            addDevice: (msg, device)=> {
                if (msg.payload === undefined || typeof msg.payload != "object") {
                    msg.payload = {};
                }
    
                if (msg.payload.devices === undefined) {
                    msg.payload.devices = [];
                }
    
                msg.payload.devices.push(device);
                return msg;
            }
        }
    },
    outputs: {
        preapreOutputFor: (index, payload) => {
            var output = [];
            for (var i = 0; i < index; i++) {
                output.push(null);
            }

            output.push(payload);
            return output;
        }
    }
};