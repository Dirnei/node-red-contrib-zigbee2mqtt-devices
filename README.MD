# Zigbee2MQTT Nodes for Node-RED

![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)

## Available Nodes

Many nodes are availabe right now and there are still new node ideas that will be added in the near future. Here is a list of the currently availabe ones:

- [generic-lamp](docs/nodes/generic-lamp.md)
    - Used to prepare the mqtt messages that are sent to zigbee2mqtt
- [send-messages](docs/nodes/send-messages.md)
    - Sends the prepared mqtt messages via the mqtt broker to zigbee2mqtt
- [override-nodes](docs/nodes/override-nodes.md)
    - all override nodes will override the specific property configured in a generic lamp node. used to set the same value for all devices in the same message
        - override brightness
        - override temperature
        - override color
- device status
    - outputs the plain mqtt message a device sends
- button switch
    - expects an input of a remote device. it will parse the pressed button type and will output the message to the specific output
        - pressed
        - hold
        - released
        - double
    - implemented remote devices:
        - Ikea Dimmer
        - Ikea Remote
        - Sonoff Touch Button
        - Scenic Friend of Hue
    - future implementations
        - Hue Smart button
        - Hue Dimmer switch
        - Tint Color remote
- sonoff button
    - receives messages of a sonoff touch button and will prepare the payload for a button switch node
- ikea dimmer
    - receives messages of a ikea dimmer and will prepare the payload for a button switch node
- ikea remote
    - receives messages of a ikea remote and will prepare the payload for a button switch node
- scenic foh switch
    - receives messages of a scenic friends of hue and will prepare the payload for a button switch node
- contact sensor
    - receives messages from a contact sensor and outputs the payload to the open or closed output dependent on the payload
- occupancy sensor
    - receives messages from a occupancy sensor and outputs the payload to the occupied or no motion output depentent on the payload
- climate sensor
    - receives messages from a temperature, humidity and or pressure sensor and displays the value as status and send the payload to the output
- scene in
    - can be compared with a link node. the scene name is used in a scene selector node an will also be trigger from the scene selector node
- scene selector
    - you can add "scene in" nodes to a list. this list can be cyceled with a messages. This enables you to create scenes for your smarthome. the input message must have following properties:
        - msg.command
            - available commands:
                - next
                - previous
                - set
        - msg.scene
            - allowed scene values:
                - index (the index of the scene that are configured) e.g.: 0 (first scene in the list)
                - name (the name of the scene-in node you want to trigger)

# Configuration

[Bridge config](docs/config/bridge-config.md)

## Searching for help?

Join the [Discord server](https://discord.gg/4qCMEhJ) for support while the documentation is not finished :)
