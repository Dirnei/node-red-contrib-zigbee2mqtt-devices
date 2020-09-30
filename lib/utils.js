
function setConnectionState(bridgeNode, node) {
    if (bridgeNode.isConnected() === true) {
        node.status({ fill: "green", text: "connected" });
    } else {
        node.status({ fill: "blue", text: "not connected" });
    }
}

function createButtonOutput(output, name, type) {
    return {
        index: output,
        button_name: name,
        button_type: type,
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

const bavaria = require("node-red-ext-bavaria-black");

module.exports = { 
    createButtonOutput: createButtonOutput,
    bavaria: () => bavaria,
    sendAt: sendAt,
    setConnectionState: setConnectionState,
};