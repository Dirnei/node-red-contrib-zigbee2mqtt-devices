"use strict";
module.exports = function (RED) {
    function getSceneInNodes(scene) {
        var nodes = [];
        RED.nodes.eachNode(function (n) {
            try {
                if (n.type === "scene-in" && n.scene === scene) {
                    nodes.push(RED.nodes.getNode(n.id));
                }
            }
            catch (err) {
                console.log(err);
            }
        });
        return nodes;
    }
    function sceneIn(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.isActive = function () {
            return config.active;
        };
        this.trigger = function (msg) {
            if (config.active === true) {
                msg.scene = config.scene;
                node.send(msg);
            }
        };
    }
    RED.nodes.registerType("scene-in", sceneIn);
    function sceneSelector(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        if (config.scenes.length === 0) {
            node.status({ fill: "red", text: "no scenes configured" });
            return;
        }
        var nodeContext = this.context();
        if (!nodeContext.get("index")) {
            nodeContext.set("index", -1);
        }
        function setState(index) {
            var scene = index == -1 ? "---" : config.scenes[index];
            node.status({
                fill: "yellow",
                text: "Idx: " + index + ", Scene: " + scene
            });
        }
        var index = nodeContext.get("index");
        setState(index);
        node.on("input", function (msg) { return handleMessage(msg, 0); });
        function handleMessage(msg, revCount) {
            if (revCount >= config.scenes.length) {
                node.error("All configured scenes are inactive");
                return;
            }
            revCount++;
            var command = msg.command !== undefined ? msg.command : msg.payload.command;
            var scene = msg.scene;
            if (!scene && msg.payload) {
                scene = msg.payload.scene;
            }
            if (!command) {
                return;
            }
            switch (command) {
                case "next":
                    index++;
                    break;
                case "previous":
                case "prev":
                    index--;
                    break;
                case "set":
                    if (typeof scene === "number" && scene < config.scenes.length && scene >= 0) {
                        index = scene;
                    }
                    else if (typeof scene === "string") {
                        index = config.scenes.indexOf(scene);
                        if (index < 0) {
                            node.error("invalid scene");
                            return;
                        }
                    }
                    else {
                        node.error("invalid scene");
                        return;
                    }
                    break;
                default:
                    node.error("Command not found");
                    return;
            }
            if (config.wrapAround === false) {
                index = Math.min(config.scenes.length - 1, index);
                index = Math.max(0, index);
            }
            else {
                if (index >= config.scenes.length) {
                    index = 0;
                }
                else if (index < 0) {
                    index = config.scenes.length - 1;
                }
            }
            if (config.changedOutputOnly === false || nodeContext.get("index") != index) {
                var nodes = getSceneInNodes(config.scenes[index]).filter(function (n) { return n.isActive(); });
                if (nodes.length === 0) {
                    if (command === "next" || command === "previous") {
                        handleMessage(msg, revCount);
                    }
                    else {
                        node.error("No active node for scene \"" + config.scenes[index] + "\" found.");
                        return;
                    }
                }
                msg.command = undefined;
                nodes.forEach(function (n) {
                    n.trigger(msg);
                });
                nodeContext.set("index", index);
                setState(index);
            }
        }
    }
    RED.nodes.registerType("scene-selector", sceneSelector);
};
