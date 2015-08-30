var im = require('imagemagick'),
	async = require('async'),
	logger = require('tracer').colorConsole();

module.exports.generateImages = function(image_path, dimensions, callback) {
	var images = [];
	async.each(dimensions, function(dim, callback) {
		im.identify(image_path, function(err, features) {
			if(err) {
				callback(err);
			} else {
				var image_resize_obj = {
					srcPath: image_path,
					quality: 0.8
				};

				if(features.width > features.height) {
					image_resize_obj.width = dim.width;
				} else {
					image_resize_obj.height = dim.height;
				}

				im.resize(image_resize_obj, function(err, stdout, stderr) {
					if(err) {
						callback(err);
					} else {
						var image_buffer = new Buffer(stdout, "binary");
						images.push({
							name: image_buffer.length,
							size: dim.size,
							data: image_buffer
						});
						callback();
					}
				});
			}
		});
	}, function(err) {
		if(err) {
			callback(err)
		} else {
			callback(null, images);
		}
	});
}