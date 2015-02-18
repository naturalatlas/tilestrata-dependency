module.exports = function(layer, filename) {
	return {
		serve: function(server, req, callback) {
			var mock = req.clone();
			mock.layer = layer;
			mock.filename = filename;
			mock.headers = {};
			if (req.headers['x-tilestrata-skipcache']) {
				mock.headers['x-tilestrata-skipcache'] = '1';
			}

			server.serve(mock, false, function(status, buffer, headers) {
				if (status === 200) {
					callback(null, buffer, headers);
				} else {
					var message = 'Tile unavailable (status ' + status + ')';
					if (buffer.length < 1024) message = buffer.toString('utf8');
					callback(new Error(message));
				}
			});
		}
	};
};