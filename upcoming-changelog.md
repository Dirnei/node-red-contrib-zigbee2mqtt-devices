# Changelog for the upcoming version
> This document is an internal note for the changelog of the upcoming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.

### Release: `0.19.5`

#### Features:


#### Bug fixes:
- Hosting the Node-RED UI under a different root path than `http://localhost:1880/` resulted in failing web requests to load the device list. For example, when the UI was set to `http://localhost:1880/admin` or Node-RED was running as a Home Assistant plugin.

#### Behind the scenes