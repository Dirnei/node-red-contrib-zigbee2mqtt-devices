"use strict";
function setConnectionState(bridgeNode, node) {
    if (bridgeNode.isConnected() === true) {
        node.status({ fill: "green", text: "connected" });
    }
    else {
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
                    name: property + "_" + type,
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
function createStateOverride(value) {
    var convertedValue = convertToOnOff(value);
    var override = createOverride("state", convertedValue);
    if (convertedValue === "ON") {
        override.brightness = 254;
    }
    return override;
}
function createOverride(name, value) {
    var override = {};
    override[name] = value;
    return override;
}
function convertToOnOff(value) {
    switch (value) {
        case "on":
        case "ON":
        case 1:
        case true:
            return "ON";
        case "off":
        case "OFF":
        case 0:
        case false:
            return "OFF";
    }
}
function propertyExists(obj, name) {
    return obj !== undefined && Object.prototype.hasOwnProperty.call(obj, name);
}
var bavaria = require("node-red-ext-bavaria-black");
module.exports = {
    createButtonOutput: createButtonOutput,
    bavaria: function () { return bavaria; },
    sendAt: sendAt,
    propertyExists: propertyExists,
    setConnectionState: setConnectionState,
    payloads: {
        createColorTempStep: function (value) { return createAction("color_temp", "step", value); },
        createColorTempMove: function (value) { return createAction("color_temp", "move", value == 0 ? "stop" : value); },
        createBrightnessStep: function (value) { return createAction("brightness", "step_onoff", value); },
        createBrightnessMove: function (value) { return createAction("brightness", "move_onoff", value); },
        createHueStep: function (value) { return createAction("hue", "step", value); },
        createHueMove: function (value) { return createAction("hue", "move", value); },
        createSaturationStep: function (value) { return createAction("saturation", "step", value); },
        createSaturationMove: function (value) { return createAction("saturation", "move", value); },
        createNextSceneCommand: function () { return createSceneCommand("next", undefined); },
        createPreviousSceneCommand: function () { return createSceneCommand("previous", undefined); },
        createSetSceneCommand: function (value) { return createSceneCommand("set", value); },
        convertToOnOff: convertToOnOff,
        overrides: {
            createStateOverride: function (value) { return { override: createStateOverride(value) }; },
            createBrightnessOverride: function (value) { return { override: createOverride("brightness", value) }; },
        },
        devices: {
            addDevice: function (msg, device) {
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
        preapreOutputFor: function (index, payload) {
            var output = [];
            for (var i = 0; i < index; i++) {
                output.push(null);
            }
            output.push(payload);
            return output;
        }
    },
    ui: {
        input: {
            getPayload: function (data, type) {
                switch (type) {
                    case "num":
                        return Number.parseFloat(data);
                    case "bool":
                        return data == true;
                    case "json":
                        return JSON.parse(data);
                }
                return data;
            }
        }
    }
};
