var AWS = require('aws-sdk'),
	fs = require('fs'),
    keygen = require("keygenerator");
var logger = require('tracer').colorConsole();

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
	    	console.log(err)
	    callback(err, null)	
	    }
	    else {
	    	var image_access_url = "https://s3-us-west-2.amazonaws.com/"+bucket+"/"+key;
	    	console.log(image_access_url);
	    callback(null, image_access_url) 
	    }
  	});
};