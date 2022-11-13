# Changelog for the upcoming version
> This document is an internal note for the changelog of the upcoming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.

### Release: `0.19.6`

#### Features:

#### Bug fixes:
- Bridge did not connect in newer z2m versions, because z2m changed the format of 'bridge/state' froms string to JSON.
- Shelly 2.5 did not connect to broker, because it used an old configuration node.
- Shelly 2.5 node did not unsubscribe from old channel with no full redeploy.

#### Behind the scenes
- Add mocha and first unit test examples
- Add integration tests to test with a real MQTT broker