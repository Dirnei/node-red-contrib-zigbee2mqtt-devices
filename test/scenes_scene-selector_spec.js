var should = require("should");
var helper = require("node-red-node-test-helper");
var sceneSelectorNode = require("../src/nodes/scenes.js");

helper.init(require.resolve('node-red'));

describe('scene-selector Node', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });

  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "scene-in", name: "scene-selector" }];
    helper.load(sceneSelectorNode, flow, function () {
      var n1 = helper.getNode("n1");
      try {
        n1.should.have.property('name', 'scene-selector');
        done();
      } catch(err) {
        done(err);
      }
    });
  });

});