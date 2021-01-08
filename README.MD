<p align="center">
  <img width="128" height="128" src="resources/logo.svg">
</p>

# Zigbee2MQTT Nodes for Node-RED

[![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://www.npmjs.com/package/node-red-contrib-zigbee2mqtt-devices)
[![img](https://img.shields.io/badge/Node--RED-node--red--contrib--zigbee2mqtt--devices-%23aa4444?style=for-the-badge)](https://flows.nodered.org/node/node-red-contrib-zigbee2mqtt-devices)
[![GitHub license](https://img.shields.io/github/license/Dirnei/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://github.com/Dirnei/node-red-contrib-zigbee2mqtt-devices/blob/master/LICENSE)

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
- [bridge-log](docs/nodes/bridge-log.md)
- And many more for sensors and remotes...

## You need some addition help?

Join the [Discord server](https://discord.gg/4qCMEhJ) for a more in depth support or problems that aren't metioned anywhere :)

[![node-red-contrib-zigbee2mqtt-devices](https://discordapp.com/api/guilds/760063909465686067/widget.png?style=banner2)](https://discord.gg/4qCMEhJ)

## Changelog 

### Release: `0.17.2`

- Added support for z2m Version `1.17.0`

### Release: `0.17.1`

#### Bugfixes

- Fixed npm package. Due to the change to TypeScript all nodes were broken because it was not build before publish.

### Release: `0.17.0`

#### Features:

- Added the **bridge log node** to provide an easy way to receive and filter logs that are published into the `zigbee2mqtt/bridge/log` topic.
- Added `Error-Notification` to the `device-list` in the `device-config-node` for better debugging the problem of the empty device list. (Will be added to all device lists if proven helpfull)

#### Bug fixes:

- Fixed typo in Shelly 2.5 node.
- Fixed toggle relay in Shelly 2.5 node.

#### Behind the scenes

- Changed code to TypeScript

## You want to contribute?

That's easy! Feel free to post suggestions, adding documentation or add new features. Every support is welcome!

If you feel very generous and want to contribute with coffee, you sure can:

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[buymeacoffee]: https://www.buymeacoffee.com/dirnei
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png
