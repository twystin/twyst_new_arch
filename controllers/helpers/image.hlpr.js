'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var async = require('async');
var AWSHelper = require('./aws.hlpr');
var fs = require('fs');
var ObjectId = require('mongoose').Types.ObjectId;


var dimensions = [{
	size: '_th',
	width: 256,
	height: 256
}, {
	size: '_sm',
	width: 640,
	height: 480
}, {
	size: '_md',
	width: 1024,
	height: 768
}, {
	size: '_lg',
	width: 1280,
	height: 1024
}];

module.exports.uploadAppImage = function(image_obj) {
	logger.log();
    var deferred = Q.defer();

    var buff = new Buffer(image_obj.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    var img_obj = {
		Bucket: 'retwyst-app',
		ACL: 'public-read',
		ContentType: content_type,
		Key: 'retwyst-user' + image_obj.user + '/'+ image_obj.event+ '/' + Date.now(),
		Body: buff
	};
    
	AWSHelper.uploadImage(img_obj, function(err, data) {
		if(err) {
			deferred.reject({
                data: err,
                message: 'Image upload error'
            });
  		} else {
  			deferred.resolve({
                data: data,
                message: 'Image uploaded successfully'
            });
		}
	});
	return deferred.promise;
	

};

module.exports.uploadOutletImage = function(image_obj) {
	logger.log();
	var deferred = Q.defer();
	var buff = new Buffer(image_obj.image.replace(/^data:image\/\w+;base64,/, ""),'base64');

	var content_type = getContentType(image_obj.image);

	if(!content_type) {
		deferred.reject({err: new Error("Invalid image type"), message: 'Image upload failed'});
	} 

	else if(image_obj.image_type=='background' || image_obj.image_type=='logo') {
		uploadCoreImage(image_obj);
	} 
	else if (image_obj.image_type=='others') {
		uploadOtherImage(image_obj);
	} 
	else {
		deferred.reject({
			err: new Error("Invalid request object"),
			message: "Invalid request object"
		});
	}

	function uploadCoreImage() {
		
		var img_obj = {
			Bucket: 'retwyst-merchants',
			ACL: 'public-read',
			ContentType: content_type,
			Key: 'retwyst-outlets' + image_obj.id + '/' + image_obj.image_type,
			Body: buff
		};
		AWSHelper.uploadImage(img_obj)
			.then(function(res) {
				deferred.resolve({data: {id: img_obj.id, key: img_obj.image_type}, message: "Image uploaded successfully"});
			}, function(err) {
				deferred.reject({err: err, message: 'Image upload failed'});
		});
		
	};

	function uploadOtherImage(image_obj) {
		deferred.reject({err: new Error("Other image uploads currently restricted"), message: "Other image uploads currently restricted"});
	}

	return deferred.promise;
};


var getResizedImages = function(img_buffer) {
	logger.log();
	var deferred = Q.defer();
	var images = [];
	async.each(dimensions, function(dim, callback) {
		var resize_obj = {
			srcData: img_buffer,
			quality: 0.8,
			width: dim.width
		}
		im.resize(resize_obj, function(err, stdout, stderr) {
			if(err) {
				callback(err);
			} else {
				var image_buffer = new Buffer(stdout, 'binary');
				var image = {
					name: d.size,
					data: image_buffer
				}
				images.push(image);
				callback();
			}
		}, function(err) {
			if(err) {
				deferred.reject(err);
			} else {
				deferred.resolve(images);
			}
		});
	})
	return deferred.promise;
}

var getContentType = function(img_buf) {
	if(img_buf.indexOf('image/jpeg')!==-1) {
		return 'image/jpeg';
	} else if (img_buf.indexOf('image/png')!==-1) {
		return 'image/png';
	} else {
		return '';
	}
}