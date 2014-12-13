var tilestrata = require('tilestrata');
var TileServer = tilestrata.TileServer;
var TileRequest = tilestrata.TileRequest;
var dependency = require('../index.js');
var assert = require('chai').assert;

describe('Provider Implementation "dependency"', function() {
	describe('serve()', function() {
		it('should fetch and return dependency', function(done) {
			var server = new TileServer();
			server.registerLayer(function(layer) {
				layer.setName('basemap');
				layer.registerRoute('tile.txt', function(handler) {
					handler.registerProvider({
						serve: function(server, req, callback) {
							callback(null, new Buffer('Test dependency', 'utf8'), {'X-Test': 'header'});
						}
					});
				});
			});

			var provider = dependency('basemap', 'tile.txt');
			var req = TileRequest.parse('/basemap/3/2/1/tile.txt');
			provider.serve(server, req, function(err, buffer, headers) {
				assert.isFalse(!!err);
				assert.instanceOf(buffer, Buffer);
				assert.equal(buffer.toString('utf8'), 'Test dependency');
				assert.deepEqual(headers, {'X-Test': 'header'});
				done();
			});
		});
	});
});