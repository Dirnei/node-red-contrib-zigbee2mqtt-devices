# Changelog for the upcomming version
> This document is an internal note for the changelog of the upcomming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.


### Release: `0.17.0`


#### Features:

- Added the **bridge log node** to provide an easy way to receive and filter logs that are published into the `zigbee2mqtt/bridge/log` topic.
- Added `Error-Notification` to the `device-list` in the `device-config-node` for better debugging the problem of the empty device list. (Will be added to all device lists if proven helpfull)

#### Bug fixes:

- Fixed typo in Shelly 2.5 node.
- Fixed toggle relay in Shelly 2.5 node.

#### Behind the scenes

- Changed code to TypeScript