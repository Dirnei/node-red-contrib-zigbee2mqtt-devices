# Changelog for the upcomming version
> This document is an internal note for the changelog of the upcomming release.

> If new features are added, increase the minor version || if bug fixes are added, increase the patch version.

### Release: `0.20.0`

#### Features:

#### Bug fixes:

- Better handling for invalid mqtt messages from z2m. Sometimes a required/expected property is missing or empty which caused an error.

#### Behind the scenes

- Removed some unnecessary files from the package, reducing the size from 324 kB to 229 kB
- Removed vulnerable dependencies
- Updated and thinned out dependencies so the installation will be faster
- Dev feature: Cleaned up npm build scripts so there are no warnings, and they behave the same on Windows, Linux, and macOS.