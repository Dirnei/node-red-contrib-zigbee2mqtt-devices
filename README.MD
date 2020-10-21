# Zigbee2MQTT Nodes for Node-RED

[![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://www.npmjs.com/package/node-red-contrib-zigbee2mqtt-devices)
[![img](https://img.shields.io/badge/Node--RED-node--red--contrib--zigbee2mqtt--devices-%23aa4444?style=for-the-badge)](https://flows.nodered.org/node/node-red-contrib-zigbee2mqtt-devices)
[![GitHub license](https://img.shields.io/github/license/Dirnei/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://github.com/Dirnei/node-red-contrib-zigbee2mqtt-devices/blob/master/LICENSE)

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

## Changelog 

### v0.14.0 !! Breaking-change !!

- Moved mqtt configuration into own [node](docs/config/mqtt-config.md)
- Added support for [Shelly 2.5](https://shelly.cloud/products/shelly-25-smart-home-automation-relay/)
- Fixed device list request in [device-config](docs/device-config.md)
- Changed colors of some nodes
- Added [override-state](docs/nodes/override-state.md) node
- [button-switch](docs/nodes/button-switch.md) outputs can now be disabled to reduce the number of outputs
- added color picker to [override-color](docs/nodes/override-color.md) node

### v0.13.1

- Fixed validation on newly added [override-action](docs/nodes/override-action.md) node

### v0.13.0

- Added _Müller Licht - tint_ remote device support
- Added [override-action](docs/nodes/override-action.md) node
- Removed ```delay``` property from mqtt payload, as it is only used internally

### v0.12.0

- Added [ota-node](docs/nodes/ota-node.md)
- Updated dashboard for ota updates
- Some code restructuring
- Smaller bugfixes
- Probably added some bugs that need to be fixed later :)

## You want to contribute?

That's easy! Feel free to post suggestions, adding documentation or add new features. Every support is welcome!

If you feel very generous and want to contribute with coffee, you sure can:

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[buymeacoffee]: https://www.buymeacoffee.com/dirnei
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png