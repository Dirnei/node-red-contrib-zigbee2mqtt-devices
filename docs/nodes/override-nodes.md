# Override nodes

There are multiple override node available. The behaviour of each node is still the same. It overrides the properties that are set in a [genric-lamp](generic-lamp.md) node. If a device does not support the properties that the override node will set, it will have no effect. The override is applied to all *generic-lamp* nodes in the flow.

## Available nodes

- [override-state](override-state.md) Overrides the `ON`/`OFF` state.
- [override-brightness](override-brightness.md) Overrides the brightness of a lamp.
- [override-temperature](override-temperature.md) Overrides light temperature of a lamp.
- [override-color](override-color.md) Overrides the light color of a lamp.
- [override-action](override-action.md) Modify brightness/color over time or in steps.

[*← back to the index*](../documentation.md)