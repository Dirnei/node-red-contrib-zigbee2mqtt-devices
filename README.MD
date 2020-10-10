# Zigbee2MQTT Nodes for Node-RED

[![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://www.npmjs.com/package/node-red-contrib-zigbee2mqtt-devices)
[![img](https://img.shields.io/badge/Node--RED-node--red--contrib--zigbee2mqtt--devices-%23aa4444?style=for-the-badge)](https://flows.nodered.org/node/node-red-contrib-zigbee2mqtt-devices)

This project contains Node-RED nodes that allows you to build Smart Home szenarios with your Zigbee devices connected to [ZigBee2MQTT](https://www.zigbee2mqtt.io/). 

![img](docs/img/overview.png)


## Available Nodes

Many nodes are available right now, and there are still new node ideas that will be added in the near future. Here is a list of the currently available ones:

- [generic-lamp](docs/nodes/generic-lamp.md)
- [send-messages](docs/nodes/send-messages.md)
- [override-nodes](docs/nodes/override-nodes.md)
- [button-switch](docs/nodes/button-switch.md)
- [scene-in](docs/nodes/scene-in.md)
- [scene-selector](docs/nodes/scene-selector.md)
- [ota-node](docs/nodes/ota-node.md)
- And many more for sensors and remotes...

## Getting started:

Have a look at [this](docs/getting-started.md). All you need are some allready paired Zigbee lamps and a installed Node-RED. What are you waiting for? Find out now, how easy it is to get started.  

## You need some addition help?

Join the [Discord server](https://discord.gg/4qCMEhJ) for a more in depth support or problems that aren't metioned anywhere :)

## Changelog 

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

More changelogs are available [here](docs/changelog.md)

## You want to contribute?

That's easy! Feel free to post suggestions, adding documentation or add new features. Every support is welcome!

If you feel very generous and want to contribute with coffee, you sure can:

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[buymeacoffee]: https://www.buymeacoffee.com/dirnei
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png