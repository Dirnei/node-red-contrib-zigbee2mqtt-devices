module.exports = function (RED) {
    const utils = require("./lib/utils.js");

    RED.httpAdmin.get("/z2m/devices/:broker/:deviceType/:vendor/:model", function (req, res) {
        try {
            var response = {
                success: false,
                message: "",
                devices: []
            };

            var broker = RED.nodes.getNode(req.params.broker.replace("_", "."));

            if (broker === undefined || broker === null) {
                response.message = "Unable to find broker. Pleas deploy first and try it again.";
                res.end(JSON.stringify(response));
                return;
            }

            var devices = broker.getDeviceList();
            var type = req.params.deviceType.toLowerCase();

            var vendor = decodeURI(req.params.vendor).toLowerCase();
            var model = decodeURI(req.params.model).toLowerCase();

            if (model !== "all" && model.includes(",")) {
                model = model.split(",");
            }
            else if (model !== "all") {
                model = [model];
            }

            response.devices = minimizeDeviceList(filterDevices(devices, type, vendor, model));
            response.success = devices.length > 0;

            if (!response.success) {
                response.message = "No devices found!";
            }

            if (response.success && response.devices.length == 0) {
                response.success = false;
                response.message = `No devices found after filtering! Used Filter: (Vendor: ${vendor}, Model: ${model}, Type: ${type})`;
            }

            console.log("---------------- RESPONSE -----------------");
            console.log(response);
            console.log("-------------------------------------------");

            res.end(JSON.stringify(response));
        } catch (err) {
            res.end(JSON.stringify(response));
            console.log(err);
        }
    });

    function minimizeDeviceList(devices) {
        return devices.map((value) => {
            return {
                friendly_name: value.friendly_name,
                address: value.ieee_address,
                type: value.type,
                model: value.definition.model,
                vendor: value.definition.vendor,
                version: value.software_build_id
            };
        });
    }

    function isClimateSensorProperty(expose) {
        switch (expose.property) {
            case "temperature":
            case "humidity":
            case "pressure":
                return true;
        }

        return false;
    }

    function isContactSensorProperty(expose) {
        return expose.property === "contact";
    }

    function isOccupancySensorProperty(expose) {
        return expose.property === "occupancy";
    }

    function filterDevices(devices, type, vendor, model) {
        var specialTypes = ["climate", "contact", "occupancy"];
        var isSpecialType = specialTypes.includes(type);

        return devices.filter(e => {
            try {

                if (e.definition === undefined || e.definition === null) {
                    return false;
                }

                var dt = e.type.toLowerCase();
                var dv = "all";
                var dm = "all";

                if (isSpecialType === true && dt == "enddevice" && e.definition.exposes !== undefined) {
                    var match = 0;
                    e.definition.exposes.forEach(expose => {
                        if (match === 0 && expose.property !== undefined) {
                            switch (type) {
                                case "climate":
                                    match |= isClimateSensorProperty(expose);
                                    break;
                                case "contact":
                                    match |= isContactSensorProperty(expose);
                                    break;
                                case "occupancy":
                                    match |= isOccupancySensorProperty(expose);
                                    break;
                            }
                        }
                    });

                    if (match === 1) {
                        return true;
                    }
                }

                if (e.definition.vendor) {
                    dv = e.definition.vendor.toLowerCase();
                }

                if (e.definition.model) {
                    dm = e.definition.model.toLowerCase();
                }

                return (dt == type || (type == "enddevice" && dt == "greenpower") || (type == "all" && dt !== "coordinator")) &&
                    (dv == vendor || (vendor == "all")) &&
                    ((model == "all") || model.includes(dm));
            } catch (err) {
                console.log(err);
                console.log(e);
            }
        });
    }

    RED.httpAdmin.get("/z2m/scenes", function (req, res) {
        try {
            var scenes = [];
            RED.nodes.eachNode(n => {
                if (n.type === "scene-in") {
                    if (scenes.every(s => s != n.scene)) {
                        scenes.push(n.scene);
                    }
                }
            });

            res.end(JSON.stringify({
                scenes: scenes
            }));
        } catch (err) {
            console.log(err);
        }
    });
};
