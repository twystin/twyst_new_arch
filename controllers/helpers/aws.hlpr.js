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


module.exports.uploadObject = function(upload_obj, callback) {
	logger.log();
	var bucket = "retwyst-app";
	var s3 = new AWS.S3();
	var key = keygen._();
	var buff = new Buffer(upload_obj.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
  	s3.putObject({
	    ACL : 'public-read',
	    Bucket: bucket,
	    ContentType: 'image/jpg',
	    Key: key,
	    Body: buff
	  }, function(err) {
	    if(err) {
	    callback(err, null)	
	    }
	    else {
	    	var image_access_url = "https://s3-us-west-2.amazonaws.com/"+bucket+"/"+key;
	    callback(null, image_access_url) 
	    }
  	});
};

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