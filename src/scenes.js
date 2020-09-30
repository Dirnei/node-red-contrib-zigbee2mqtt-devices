module.exports = function (RED) {

    function triggerScene(scene, msg) {
        RED.nodes.eachNode(n => {
            try {
                if (n.type === "scene-in" && n.scene === scene) {
                    RED.nodes.getNode(n.id).trigger(msg);
                }
            } catch (err) {
                console.log(err);
            }
        });
    }

    function sceneIn(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.trigger = function (msg) {
            msg.scene = config.scene;
            node.send(msg);
        }
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
            nodeContext.set("index", - 1);
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

        node.on('input', function (msg) {
            var command = msg.command;
            if (!command) {
                return;
            }

            switch (command) {
                case "next":
                    index++;
                    break;
                case "previous":
                    index--;
                    break;
                case "set":
                    if (typeof msg.scene === "number" && msg.scene < config.scenes.length && msg.scene >= 0) {
                        index = msg.scene;
                    } else if (typeof msg.scene === "string") {
                        index = config.scenes.indexOf(msg.scene);
                        if (index < 0) {
                            node.error("invalid scene");
                            return;
                        }
                    } else {
                        node.error("invalid scene");
                        return;
                    }
                    break;
                default:
                    node.error("Command not found");
                    break;
            }

            if (config.wrapAround === false) {
                index = Math.min(config.scenes.length - 1, index);
                index = Math.max(0, index);
            } else {
                if (index >= config.scenes.length) {
                    index = 0;
                } else if (index < 0) {
                    index = config.scenes.length - 1;
                }
            }

            if (!config.changedOutputOnly || nodeContext.get("index") != index) {
                nodeContext.set("index", index);
                msg.command = undefined;
                triggerScene(config.scenes[index], msg);
                setState(index);
            }
        });
    }
    RED.nodes.registerType("scene-selector", sceneSelector);
}