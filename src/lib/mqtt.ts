
export type MqttSubscriptionCallback = (payload: any, topic: string) => void

export class MqttSubscription {
    topic: string;
    regex: RegExp;
    jsonPayload: boolean;
    callback: MqttSubscriptionCallback;

    constructor(topic: string, jsonPayload: boolean, callback: MqttSubscriptionCallback) {
        this.topic = topic;
        let tmp: string = topic.split("+").join("[^\/]*");
        tmp = tmp.split("#").join(".+");
        this.regex = new RegExp(tmp + "$");
        this.callback = callback;
        this.jsonPayload = jsonPayload;
    }

    invokeIfMatch(topic: string, payload: any) {
        if (this.comapreTopic(topic)) {
            if (this.jsonPayload) {
                try{
                    payload = JSON.parse(payload);
                } catch(err){
                    console.log("################################################################");
                    console.log(" node-red-contrib-zigbee2mqtt-devices error:");
                    console.log(err);
                    console.log("################################################################");
                }
            }

            this.callback(payload, topic);
        }
    }

    comapreTopic(topic: string) {
        return this.regex.test(topic);
    }
}