# Zigbee2MQTT Nodes for Node-RED

[![npm](https://img.shields.io/npm/v/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://www.npmjs.com/package/node-red-contrib-zigbee2mqtt-devices)
[![img](https://img.shields.io/badge/Node--RED-node--red--contrib--zigbee2mqtt--devices-%23aa4444?style=for-the-badge)](https://flows.nodered.org/node/node-red-contrib-zigbee2mqtt-devices)
[![GitHub license](https://img.shields.io/github/license/Dirnei/node-red-contrib-zigbee2mqtt-devices?style=for-the-badge)](https://github.com/Dirnei/node-red-contrib-zigbee2mqtt-devices/blob/master/LICENSE)


<p align="center">
  <div style="background:white;text-align:center">
     <img width="256" height="256" src="resources/logo.svg">
  </div>
</p>

This project contains Node-RED nodes that allow you to build Smart Home scenarios with your Zigbee devices connected to [ZigBee2MQTT](https://www.zigbee2mqtt.io/).

![overview](docs/img/overview.png)

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

## Getting started

Have a look at [the getting started guide.](docs/getting-started.md). All you need are some already paired Zigbee lamps and an installed Node-RED. What are you waiting for? Find out now how easy it is to get started.

## Documentation

The [documentation](docs/documentation.md) for the project is located in the `docs` folder.

## You need some addition help?

Join the [Discord server](https://discord.gg/4qCMEhJ) for a more in depth support or problems that aren't metioned anywhere :)

[![node-red-contrib-zigbee2mqtt-devices](https://discordapp.com/api/guilds/760063909465686067/widget.png?style=banner2)](https://discord.gg/4qCMEhJ)

## You want to contribute?

That's easy! Feel free to post suggestions, adding documentation or add new features. Every support is welcome!

If you feel very generous and want to contribute with coffee, you sure can:

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

[buymeacoffee]: https://www.buymeacoffee.com/dirnei
[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png

## Changelog 

### Release: `0.20.0` _3 Jan 2024_

#### Features:

- Add support for Ikea Styrbar (E2001) remote control

#### Bug fixes:

- Setting brightnes to 0 did not turn it off. Now it will override the state to "OFF"
- Fixed Scenic Friend of Hue switch. Property names has changed between versions

### Release: `0.19.6` _13 Nov 2022_

#### Features:

#### Bug fixes:
- Bridge did not connect in newer z2m versions because z2m changed the format of 'bridge/state' from string to JSON.
- Shelly 2.5 did not connect to the broker, because it used an old configuration node.
- Shelly 2.5 node did not unsubscribe from the old channel with no full redeploy.

#### Behind the scenes
- Add mocha and first-unit test examples
- Add integration tests to test with a real MQTT broker

### Release: `0.19.5` - _14 Mar 2022_

#### Bug fixes:

- Hosting the Node-RED UI under a different root path than `http://localhost:1880/` resulted in failing web requests to load the device list. For example, when the UI was set to `http://localhost:1880/admin` or Node-RED was running as a Home Assistant plugin.
- Fixed a bug where the configured device name gets deleted, when the device list couldn't be loaded. Further details in #105 and #119

### Release: `0.19.4` - _01 Jan 2022_

Happy new year to all!

#### Bug fixes:
- @itupsk fixed the issue #114, where we forgot a null check on the ikea bugfix in the last release. Thanks a lot!
- Also fixed the same issue in hue, scenic and sonoff devices

### Release: `0.19.3` - _30 Dec 2021_

#### Features:
- Documented additional settings for upgrading to mosquitto 2.0 in the getting started guide.
- Documented Mirek scale. 

#### Bug fixes:
- Not set property on Ikea Remote device caused a complete Node-Red restart
- Not set property on Hue Remote device caused a complete Node-Red restart
- Preventive measure: Check action for empty string in scenic remote and sonnoff buttons

### Release: `0.19.2` - 12 Mar 2021

#### Bug fixes:

- Local node-red installation with nodejs 12 had a problem to load the node-red dependency. Removed it for now as it is only used for logging.

### Release: `0.19.1` - 8 Mar 2021

#### Bug fixes:

- Better handling for invalid MQTT messages from z2m. Sometimes a required/expected property is missing or empty which caused an error.
- Hue Dimmer switch crashed NodeRED because the power status with no action came with no action.

#### Behind the scenes

- Removed some unnecessary files from the package, reducing the size from 324 kB to 229 kB
- Removed vulnerable dependencies
- Updated and thinned out dependencies so the installation will be faster
- Dev feature: Cleaned up npm build scripts so there are no warnings, and they behave the same on Windows, Linux, and macOS.

### Release: `0.19.0` - 23 Jan 2021

#### Features:
- Two new example flows, from the getting started guide
- Documentation overview page
- Documented examples
- Show **switch to manual** button if the device-list request failed.
- Added `deviceName` to the ouput of the climate-sensor. Resolves #75
- Added `separateOuputs` option the the climate sensor. Resolves #75

### Older changelogs

You can find all the release notes at the [Release-Page](https://github.com/Dirnei/node-red-contrib-zigbee2mqtt-devices/releases)
