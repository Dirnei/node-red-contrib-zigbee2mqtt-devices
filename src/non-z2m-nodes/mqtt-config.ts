import {MqttClient}                                                                                       from "mqtt";
import {NodeAPI}                                                                                                                     from "node-red";
import {MqttConfigCallback, MqttConfigCallbackMessage, MqttConfigCredentials, MqttConfigNode, MqttConfigNodeDef, MqttConfigSubsType} from "../types";

module.exports = function (RED: NodeAPI) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    // TODO: destructor für default value?
    // function MqttConfigConstructor(this: MqttConfigNode, {name, protocol = "mqtt", broker, requireLogin = false}: MqttConfigNodeDef) {
    function MqttConfigConstructor(this: MqttConfigNode, config: MqttConfigNodeDef) {
        RED.nodes.createNode(this, config);

        // TODO: Type ?
        const mqtt = require("mqtt");
        this.name = config.name;
        this.broker = config.protocol + "://" + config.broker;
        this.requireLogin = config.requireLogin;
        const _subs: Array<MqttConfigSubsType> = [];
        const node = this;

        let options = {};
        if (node.requireLogin) {
            options = {
                username: this.credentials.username,
                password: this.credentials.password
            };
        }

        const client: MqttClient = mqtt.connect(this.broker, options);
        this.mqttClient = client;

        this.isConnected = function () {
            return client.connected;
        };
        this.isReconnecting = function () {
            return client.reconnecting;
        };
        this.publish = function (topic, message) {
            client.publish(topic, message);
        };
        this.subscribeDevice = function (nodeId, topic, callback) {
            subscribeInternal(nodeId, topic, callback, true);
        };
        this.subscribe = function (nodeId, topic, callback) {
            subscribeInternal(nodeId, topic, callback, false);
            client.subscribe(topic);
            return true;
        };
        this.unsubscribe = function (nodeId) {
            const sub = _subs.find(e => e.nodeId == nodeId);
            if (sub) {
                const topic = sub.topic;
                const index = _subs.indexOf(sub);
                _subs.splice(index, 1);
                if (!sub.isDevice && !_subs.some(s => s.topic == topic)) {
                    client.unsubscribe(sub.topic);
                }
            }
        };

        function subscribeInternal(nodeId: string, topic: string, callback: MqttConfigCallback, isDevice: boolean) {
            let sub = _subs.find(e => e.nodeId == nodeId);
            if (sub) {
                if (sub.topic !== topic) {
                    client.unsubscribe(sub.topic);
                }

                sub.topic = topic;
                sub.callback = callback;
            } else {
                sub = {
                    nodeId: nodeId,
                    topic: topic,
                    callback: callback,
                    isDevice: isDevice
                };

                _subs.push(sub);
            }
        }

        client.on("message", function (topic, message) {
            try {
                // Zuerst prüfen ob uns der Topic überhaupt interessiert bevor wir den Buffer laden.
                const subs = _subs.filter(e => compareTopic(e.topic, topic));

                if (subs.length <= 0) {
                    return;
                }

                // TODO: Prüfe ob das JSON Object die nötigen Informationen besitzt um vom Typ "MqttConfigCallbackMessage" zu sein.
                let payload: MqttConfigCallbackMessage = JSON.parse(message.toString("utf8"));

                subs.forEach(e => {
                    try {
                        e.callback(payload, topic);
                    } catch (err) {
                        console.log(err);
                    }
                });

                // let message = message.toString("utf8");
                // if (message.startsWith("{")) {
                //     message = JSON.parse(message);
                // }

            } catch (err) {
                node.error(topic + " - " + err);
            }
        });

        function compareTopic(subscriptionTopic: string, messageTopic: string) {
            if (subscriptionTopic === messageTopic) {
                return true;
            }

            if (subscriptionTopic.endsWith("+")) {
                const subSegments = subscriptionTopic.split("/");
                const topicSegments = messageTopic.split("/");

                if (subSegments.length === topicSegments.length) {
                    subSegments.pop();
                    topicSegments.pop();

                    for (let i = 0; i < subSegments.length; i++) {
                        if (subSegments[i] !== topicSegments[i]) {
                            return false;
                        }
                    }

                    return true;
                }
                return false;
            }

            return false;
        }

        client.on("connect", function () {
            bavaria.observer.notify(node.id + "_connected", {});
        });

        node.on("close", function () {
            client.end(true);
        });
    }

    RED.nodes.registerType("mqtt-config", MqttConfigConstructor, {
        credentials: MqttConfigCredentials
    });
};