var leberkas = "Senft";
var counter = 0;
var callers = [];

function HalloDepp(caller){
    callers.push(caller);
    leberkas = "Schnitzel" + counter + " " + callers.join("|");
    counter++;
}

function getLeberkas(){
    return leberkas;
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
    getLeberkas: getLeberkas,
    HalloDepp: HalloDepp,
    createButtonOutput: createButtonOutput,
    bavaria: () => bavaria,
    sendAt: sendAt
};