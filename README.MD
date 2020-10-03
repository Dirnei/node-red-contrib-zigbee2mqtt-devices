# Zigbee2MQTT Nodes for Node-RED

![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)

## Available Nodes

Many nodes are available right now, and there are still new node ideas that will be added in the near future. Here is a list of the currently available ones:

### Allready documented
- [generic-lamp](docs/nodes/generic-lamp.md)
- [send-messages](docs/nodes/send-messages.md)
- [override-nodes](docs/nodes/override-nodes.md)
- [button-switch](docs/nodes/button-switch.md)
- [scene-in](docs/nodes/scene-in.md)
- [scene-selector](docs/nodes/scene-selector.md)
- [ota-node](docs/nodes/ota-node.md)

### Undocumented
- device status
    - Outputs the plain MQTT message a device sends.
- contact sensor
    - Receives messages from a contact sensor and outputs the payload to the open or closed output dependent on the payload.
- occupancy sensor
    - Receives messages from an occupancy sensor and outputs the payload to the occupied or no motion output dependent on the payload.
- climate sensor
    - Receives messages from temperature, humidity, or pressure sensors, displays the value as status, and sends the payload to the output.

## Manufacturer specific devices

- sonoff button
    - Receives messages of a sonoff touch button and will prepare the payload for a button switch node.
- ikea dimmer
    - Receives messages of an Ikea dimmer and will prepare the payload for a button switch node.
- Ikea remote
    - Receives messages of an Ikea remote and will prepare the payload for a button switch node.
- scenic foh switch
    - Receives messages of a scenic friends of hue and will prepare the payload for a button switch node. 

## Configuration

[Bridge config](docs/config/bridge-config.md)

## Searching for help?

Join the [Discord server](https://discord.gg/4qCMEhJ) for support while the documentation is not finished :)
