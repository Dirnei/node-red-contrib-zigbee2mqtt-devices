# Bridge configuration

Define the connection to your MQTT-Broker and the base MQTT-Topic, which is defined in the zigbee2mqtt configuration.yaml.

![img](img/bridge-config-config.png)

---

## Broker

Detailed information about the mqtt-config can be found [here](mqtt-config.md)

---

## Base MQTT Topic

This is defined in your zigbee2mqtt ```configuration.yaml```

Default value is __zigbee2mqtt__

---

## Output Bridge logs

If enabled, logs published to topic `zigbee2mqtt/bridge/logging` will be printed on the debug tab.

> Default: off

> Only messages with log-level warning and error will be written to the debug tab. The info log-level adds to much noise, because every published message will also be published under the same topic. 
(Current discussion about this topic: https://github.com/Koenkk/zigbee2mqtt/discussions/5633)

---

## Allow Device Status Refresh

To reduce the amount of messages that will be sent, you can turn off the status refresh messages, as they only are used to update the state of the node and for nothing else. 

> Default: on


[*← back to the index*](../documentation.md)