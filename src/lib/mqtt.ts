import { log } from "node-red";

export type MqttSubscriptionCallback = (payload: any, topic: string) => void

export class MqttSubscription {
    topic: string;
    regex: RegExp;
    jsonPayload: boolean;
    callback: MqttSubscriptionCallback;

    constructor(topic: string, jsonPayload: boolean, callback: MqttSubscriptionCallback){
        this.topic = topic;
        let tmp: string = topic.split("+").join("[^\/]*");
        tmp = tmp.split("#").join(".+");
        this.regex = new RegExp(tmp + "$");
        this.callback = callback;
        this.jsonPayload = jsonPayload;
    }

    invokeIfMatch(topic: string, payload: any) : void {
        if (this.comapreTopic(topic)) {
            if (this.jsonPayload) {
                try{
                    payload = JSON.parse(payload);
                } catch(err){
                    log.error("################################################################");
                    log.error(" node-red-contrib-zigbee2mqtt-devices error:");
                    log.error(err);
                    log.error("################################################################");
                }
            }

            this.callback(payload, topic);
        }
    }

    comapreTopic(topic: string) : boolean {
        return this.regex.test(topic);
    }
}