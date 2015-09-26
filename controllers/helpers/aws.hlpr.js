var AWS = require('aws-sdk'),
	fs = require('fs'),
    keygen = require("keygenerator"),
    logger = require('tracer').colorConsole(),
	Q = require('q');

AWS.config.update({
  region: 'us-west-2',
  accessKeyId: 'AKIAJTAQ7XF55TQMK5FA',
  secretAccessKey: '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'
});

module.exports.uploadImage = function(img_obj) {
	logger.log();
	var deferred = Q.defer();
	var s3 = new AWS.S3();
	s3.putObject(img_obj, function(err) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(true);
		}
	})
	return deferred.promise;
};

module.exports.cloneImage = function(img_obj) {
	logger.log();
	var deferred = Q.defer();
	var s3 = new AWS.S3();
	s3.copyObject(img_obj, function(err) {
		if(err) {
			logger.error(err);
			deferred.reject(err);
		} else {
			deferred.resolve(true);
		}
	});
	return deferred.promise;
};