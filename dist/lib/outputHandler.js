"use strict";
/**
 * Creates dynamic outputs for nodes and sends messages to the desired output.
 */
module.exports = /** @class */ (function () {
    function OutputHandler() {
    }
    /**
    * Creates a new dynamic output for the node.
    * @param {outputIndex}: Fixed index of the output.
    * @param {outputLabel}: The label of the output that is shown when hovering over it with the mouse. This value will be stored in msg.action.name to trace form which output the message came from.
    * @param {compareValue}: A unique identifier that is used in the prepareOutput method to send messages to this output. Prepare output checks that a property in the message object matches the actionName.
    * @param {actionDescription}: Human readable description stored in: message.action.description
    * @param {payload}: Fixed payload or function where to get the payload from e.g. "test" or msg => { msg.payload.valueX; }.
    */
    OutputHandler.prototype.addOutput = function (outputIndex, outputLabel, compareValue, actionDescription, payload) {
        if (!this.ioMap) {
            this.ioMap = {};
        }
        this.ioMap[compareValue] = {
            index: outputIndex,
            name: outputLabel,
            description: actionDescription,
            payload: payload
        };
        return this;
    };
    /**
     * Checks if the property specified in actionNamePathFilter matches the compareValue of one of the outputs. Then it sends the message to the matching output.
     * If actionNamePathFilter is set to "myvalue", this function checks that one of the outputs compareValues has the same value as message.myvalue.
     * @param {actionNamePathFilter}: Path to property to compare with compareValue.
     */
    OutputHandler.prototype.prepareOutput = function (actionNamePathFilter, msg) {
        var path = actionNamePathFilter.split(".");
        var value = msg;
        var isExtendedMessage = false;
        path.forEach(function (property) {
            value = value[property];
        });
        var data = this.ioMap[value];
        var payload = data.payload;
        if (typeof data.payload === "function") {
            payload = data.payload(msg);
        }
        if (payload && Object.prototype.hasOwnProperty.call(payload, "payload") === true) {
            isExtendedMessage = true;
        }
        var output = [];
        for (var i = 0; i < data.index; i++) {
            output.push(null);
        }
        var action = {
            name: data.name,
            description: data.description,
        };
        if (isExtendedMessage) {
            payload = payload.payload;
        }
        var preparedMessage = {
            action: action,
            payload: Object.assign({}, payload),
        };
        output.push(preparedMessage);
        return output;
    };
    return OutputHandler;
}());
