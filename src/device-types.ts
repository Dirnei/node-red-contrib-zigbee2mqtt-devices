export type Z2mDeviceEntry = {
    date_code: number,
    friendly_name: string,
    ieee_address: string,
    interview_completed: boolean,
    interviewing: boolean,
    model_id: string,
    network_address: number,
    power_source: string,
    supported: boolean,
    type: string,
    definition: Z2mDeviceDefinition
}

export type Z2mDeviceDefinition = {
    description: string,
    model: string,
    vendor: string,
    exposes: Array<Z2mDeviceExposesBase>
}

export type Z2mDeviceExposesBase = {
    type: string
}

export type Z2mDeviceExposesFeatures = Z2mDeviceExposesBase & {
    features: Array<Z2mDeviceProperty>
}

export type Z2mDeviceProperty = Z2mDeviceExposesBase & {
    access: number,
    description: string,
    name: string,
    property: string,
    unit: string
}

export type Z2mDeviceSwitchableProperty = Z2mDeviceProperty & {
    value_on: string,
    value_off: string,
    value_toggle: string,
}

export type Z2mDeviceListProperty = Z2mDeviceProperty & {
    values: Array<string>,
}

export type Z2mDeviceRangeProperty = Z2mDeviceProperty & {
    value_min: number,
    value_max: number,
}

export type Z2mDeviceStepableProperty = Z2mDeviceRangeProperty & {
    value_step: number,
}