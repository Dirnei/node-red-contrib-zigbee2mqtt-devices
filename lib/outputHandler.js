module.exports = class OutputHandler {

    addOutput(outputIndex, outputName, actionName, actionDescription, payload) {
        if (!this.ioMap) {
            this.ioMap = {};
        }

        this.ioMap[actionName] = {
            index: outputIndex,
            name: outputName,
            description: actionDescription,
            payload: payload
        };

        return this;
    }

    prepareOutput(actionname, msg, node) {
        var path = actionname.split(".");
        var value = msg;
        var isExtendedMessage = false;
        path.forEach(property => {
            value = value[property];
        });

        var data = this.ioMap[value];
        var payload = data.payload

        if (typeof data.payload === "function") {
            payload = data.payload(msg);
        }

        if (payload && payload.hasOwnProperty("payload") === true) {
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

        var preparedMessage = {
            action: action,
            payload: payload,
        };

        if (isExtendedMessage) {
            preparedMessage = payload;
            preparedMessage.action = action;
        }

        output.push(preparedMessage)
        return output;
    }
};