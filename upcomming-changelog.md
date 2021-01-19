# Changelog for the upcomming version
> This document is an internal note for the changelog of the upcomming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.


### Release: `0.18.1`

#### Features:

- Added a better device-type filter in device-selection for `occupancy`, `climate` and `concact` sensors. Resolves #77

#### Bug fixes:

#### Behind the scenes

- Switched generic sensor nodes to new device-selection (contact, occupancy, climate). Resolves #74
- Removed mqtt-config.ts (file was deleted) reference in package.json that caused a warning in the update-panel