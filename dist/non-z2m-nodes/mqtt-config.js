"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
module.exports = function (RED) {
    var utils = require("../lib/utils.js");
    var bavaria = utils.bavaria();
    // TODO: destructor für default value?
    // function MqttConfigConstructor(this: MqttConfigNode, {name, protocol = "mqtt", broker, requireLogin = false}: MqttConfigNodeDef) {
    function MqttConfigConstructor(config) {
        RED.nodes.createNode(this, config);
        // TODO: Type ?
        var mqtt = require("mqtt");
        this.name = config.name;
        this.broker = config.protocol + "://" + config.broker;
        this.requireLogin = config.requireLogin;
        var _subs = [];
        var node = this;
        var options = {};
        if (node.requireLogin) {
            options = {
                username: this.credentials.username,
                password: this.credentials.password
            };
        }
        var client = mqtt.connect(this.broker, options);
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
            var sub = _subs.find(function (e) { return e.nodeId == nodeId; });
            if (sub) {
                var topic_1 = sub.topic;
                var index = _subs.indexOf(sub);
                _subs.splice(index, 1);
                if (!sub.isDevice && !_subs.some(function (s) { return s.topic == topic_1; })) {
                    client.unsubscribe(sub.topic);
                }
            }
        };
        function subscribeInternal(nodeId, topic, callback, isDevice) {
            var sub = _subs.find(function (e) { return e.nodeId == nodeId; });
            if (sub) {
                if (sub.topic !== topic) {
                    client.unsubscribe(sub.topic);
                }
                sub.topic = topic;
                sub.callback = callback;
            }
            else {
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
                var subs = _subs.filter(function (e) { return compareTopic(e.topic, topic); });
                if (subs.length <= 0) {
                    return;
                }
                // TODO: Prüfe ob das JSON Object die nötigen Informationen besitzt um vom Typ "MqttConfigCallbackMessage" zu sein.
                var payload_1 = JSON.parse(message.toString("utf8"));
                subs.forEach(function (e) {
                    try {
                        e.callback(payload_1, topic);
                    }
                    catch (err) {
                        console.log(err);
                    }
                });
                // let message = message.toString("utf8");
                // if (message.startsWith("{")) {
                //     message = JSON.parse(message);
                // }
            }
            catch (err) {
                node.error(topic + " - " + err);
            }
        });
        function compareTopic(subscriptionTopic, messageTopic) {
            if (subscriptionTopic === messageTopic) {
                return true;
            }
            if (subscriptionTopic.endsWith("+")) {
                var subSegments = subscriptionTopic.split("/");
                var topicSegments = messageTopic.split("/");
                if (subSegments.length === topicSegments.length) {
                    subSegments.pop();
                    topicSegments.pop();
                    for (var i = 0; i < subSegments.length; i++) {
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
        credentials: types_1.MqttConfigCredentials
    });
};
