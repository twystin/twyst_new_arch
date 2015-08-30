var AWS = require('aws-sdk'),
	fs = require('fs'),
	AWSConfig = require('../../config/settings').values.config.aws;

AWS.config.update(AWSConfig);

var s3 = new AWS.S3();

module.exports.deleteObject = function(delete_obj, callback) {
	s3.deleteObjects(delete_obj, callback);
};

module.exports.uploadObject = function(upload_obj, callback) {
	s3.putObject(upload_obj, callback);
};