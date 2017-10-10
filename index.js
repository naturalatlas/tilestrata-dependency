module.exports = function() {
	var source, getSource;
	if (typeof arguments[0] === 'function') {
		getSource = arguments[0];
	} else {
		source = [arguments[0], arguments[1]];
		getSource = function(req) { return source; };
	}

	return {
		name: source ? source.join('/') : 'dependency',
		serve: function(server, req, callback) {
			var mock = req.clone();
			var source = getSource(req);

			if (!source) {
				var notFound = new Error('No source available for this request');
				notFound.statusCode = 404;
				return callback(notFound);
			}

			mock.method = 'GET';
			mock.layer = source[0];
			if (source[1].charAt(0) === '*') {
				mock.filename = 't' + source[1].substring(1);
				mock.hasFilename = false;
			} else {
				mock.filename = source[1];
				mock.hasFilename = true;
			}
			mock.headers = {};
			if (req.headers['x-tilestrata-skipcache']) {
				mock.headers['x-tilestrata-skipcache'] = req.headers['x-tilestrata-skipcache'];
			}

			server.serve(mock, false, function(status, buffer, headers) {
				if (status === 200) {
					// don't propagate the cache-hit header (because technically
					// this provider is serving a "new" tile)
					if (headers) delete headers['X-TileStrata-CacheHit'];

					callback(null, buffer, headers);
				} else {
					var message = 'Tile unavailable (status ' + status + ')';
					if (buffer.length < 1024) message = buffer.toString('utf8');
					var err = new Error(message);
					err.statusCode = status;
					callback(err);
				}
			});
		}
	};
};
