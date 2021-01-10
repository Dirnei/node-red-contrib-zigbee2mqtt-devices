# Changelog for the upcomming version
> This document is an internal note for the changelog of the upcomming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.


### Release: `0.18.0`


#### Features:

- Removed custom MQTT Configuration and replaced it with the MQTT Configuration from the core nodes
- Added option to `bridge-config` to disable device refresh on deployment
- Added option to `bridge-config` to log log-messages from zigbee2mqtt to the `debug tab`
- Added fallback-option to `device-selection`. If no devices are found you can now switch the list to a textbox and the the `friendly_name` manually. Resolves #71.

#### Bug fixes:

- Deployment increased the refresh messages that will be sent on deployment. Fixes #45
- Redone the device-list as payload has changed and this topic is now also retained on the mqtt broker. It should solve #32

#### Behind the scenes

- Unified device-selection. Resolved #69
