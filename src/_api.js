module.exports = function (RED) {
    const utils = require("../lib/utils.js");
    const bavaria = utils.bavaria();

    RED.httpAdmin.get('/z2m/devices/:broker/:deviceType/:vendor/:model', function (req, res) {
        try {
            var broker = RED.nodes.getNode(req.params.broker.replace("_", "."));
            var devices = broker.getDeviceList();
            var type = req.params.deviceType.toLowerCase();
            var vendor = decodeURI(req.params.vendor).toLowerCase();
            var model = decodeURI(req.params.model).toLowerCase();
    
            res.end(JSON.stringify({
                devices: devices.filter(e => {
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
                        (dm == model || (model == "all"));
                })
            }));
        } catch (err) {
            console.log(err);
        }
    });

    RED.httpAdmin.get('/z2m/scenes', function (req, res) {
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
}
