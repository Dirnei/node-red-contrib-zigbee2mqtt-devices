# Zigbee2MQTT Nodes for Node-RED

![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)

## Available Nodes

Many nodes are available right now, and there are still new node ideas that will be added in the near future. Here is a list of the currently available ones:

- [generic-lamp](docs/nodes/generic-lamp.md)
    - Used to prepare the MQTT messages that are sent to zigbee2mqtt
- [send-messages](docs/nodes/send-messages.md)
- [override-nodes](docs/nodes/override-nodes.md)
    - All override nodes will override the specific property configured in a generic lamp node. Used to set the same value for all devices in the same message.
        - override brightness
        - override temperature
        - override color
- device status
    - Outputs the plain MQTT message a device sends.
- button switch
    - Expects an input of a remote device. It will parse the pressed button type and will output the message to the specific output.
        - pressed
        - hold
        - released
        - double
    - Implemented remote devices:
        - Ikea Dimmer
        - Ikea Remote
        - Sonoff Touch Button
        - Scenic Friend of Hue
    - Future implementations
        - Hue Smart button
        - Hue Dimmer switch
        - Tint Color remote
- sonoff button
    - Receives messages of a sonoff touch button and will prepare the payload for a button switch node.
- ikea dimmer
    - Receives messages of an Ikea dimmer and will prepare the payload for a button switch node.
- Ikea remote
    - Receives messages of an Ikea remote and will prepare the payload for a button switch node.
- scenic foh switch
    - Receives messages of a scenic friends of hue and will prepare the payload for a button switch node.
- contact sensor
    - Receives messages from a contact sensor and outputs the payload to the open or closed output dependent on the payload.
- occupancy sensor
    - Receives messages from an occupancy sensor and outputs the payload to the occupied or no motion output dependent on the payload.
- climate sensor
    - Receives messages from temperature, humidity, or pressure sensors, displays the value as status, and sends the payload to the output.
- scene in
    - Can be compared with a link node. The scene name is used in a scene selector node and will also be trigger from the scene selector node.
- scene selector
    - You can add "scene in" nodes to a list. This list can be cycled with messages. This enables you to create scenes for your smart home. The input message must have the following properties:
        - msg.command
            - available commands:
                - next
                - previous
                - set
        - msg.scene
            - allowed scene values:
                - index (the index of the scene that are configured) e.g.: 0 (the first scene in the list)
                - name (the name of the scene-in node you want to trigger)

# Configuration

[Bridge config](docs/config/bridge-config.md)

## Searching for help?

Join the [Discord server](https://discord.gg/4qCMEhJ) for support while the documentation is not finished :)
