const devicesIkea = require("./nodes/devices-ikea.js");

module.exports = function (RED) {
    const utils = require("./lib/utils.js");
    const bavaria = utils.bavaria();

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

            response.devices = filterDevices(devices, type, vendor, model);
            response.success = devices.length > 0;
            if(!response.success)
            {
                response.message = "No devices found!";
            }

            console.log("-------------------------------------------");
            console.log(response);
            console.log("-------------------------------------------");

            res.end(JSON.stringify(response));
        } catch (err) {
            res.end(JSON.stringify(response));
            console.log(err);
        }
    });

    function filterDevices(devices, type, vendor, model){
        return devices.filter(e => {
            try {
                var dt = e.type.toLowerCase();
                var dv = "all";
                var dm = "all";

                if (e.vendor) {
                    dv = e.vendor.toLowerCase();
                }

                if (e.model) {
                    dm = e.model.toLowerCase();
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
