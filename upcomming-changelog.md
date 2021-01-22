# Changelog for the upcomming version
> This document is an internal note for the changelog of the upcomming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.


### Release: `0.18.1`

#### Features:

- Show **switch to manual** button if the device-list request failed.

#### Bug fixes:

#### Behind the scenes

- Switched generic sensor nodes to new device-selection (contact, occupancy, climate)
- Removed mqtt-config.ts (file was deleted) reference in package.json that caused a warning in the update-panel