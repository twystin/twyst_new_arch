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
    var timestamp = Date.now();
    var img_obj = {
		Bucket: 'retwyst-app',
		ACL: 'public-read',
		ContentType: 'image/jpg',
		Key: 'retwyst_user' + '/' + image_obj.user + '/'+ image_obj.event+ '/' + timestamp,
		Body: buff
	};
    
	AWSHelper.uploadImage(img_obj).then(function(data) {
		deferred.resolve({
            data: {path: 'https://s3-us-west-2.amazonaws.com/retwyst-app/retwyst_user' + '/' + image_obj.user + '/'+ image_obj.event+ '/' + timestamp},
            message: 'Image uploaded successfully'
        });
	},
	function(err) {
		deferred.reject({
            data: err,
            message: 'Image upload error'
        });
	});
	return deferred.promise;
	

};

module.exports.uploadOutletImage = function(image_obj) {
	logger.log();
	var deferred = Q.defer();
	var content_type = getContentType(image_obj.image);
	var buff = new Buffer(image_obj.image.replace(/^data:image\/\w+;base64,/, ""),'base64');

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
			Key: 'retwyst-outlets' + '/'+ image_obj.id + '/' + image_obj.image_type,
			Body: buff
		};
		AWSHelper.uploadImage(img_obj)
			.then(function(res) {
				deferred.resolve({data: {id: image_obj.id, key: image_obj.image_type}, message: "Image uploaded successfully"});
			}, function(err) {
				deferred.reject({err: err, message: 'Image upload failed'});
		});
		
	};

	function uploadOtherImage(image_obj) {
		deferred.reject({err: new Error("Other image uploads currently restricted"), message: "Other image uploads currently restricted"});
	}

	return deferred.promise;
};

module.exports.uploadMenuImage = function(image_obj) {
    logger.log();
    var deferred = Q.defer();
    var content_type = getContentType(image_obj.image);
    var buff = new Buffer(image_obj.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    if (!content_type) {
        deferred.reject({
            err: new Error("Invalid image type"),
            message: 'Image upload failed'
        });
    } else if (image_obj.image_type === 'item') {
        var upload_obj = {
            Bucket: 'retwyst-merchants',
            ACL: 'public-read',
            ContentType: content_type,
            Key: 'retwyst-menus' + '/' + image_obj.id + '/items/' + image_obj.item,
            Body: buff
        };
        AWSHelper.uploadImage(upload_obj)
            .then(function(res) {
                deferred.resolve({
                    data: {
                        id: image_obj.id,
                        key: image_obj.item
                    },
                    message: "Image uploaded successfully"
                });
            }, function(err) {
                deferred.reject({
                    err: err,
                    message: 'Image upload failed'
                });
            });
    } else {
        deferred.reject({
            err: new Error("Invalid request object"),
            message: "Invalid request object"
        });
    }
    return deferred.promise;
}

module.exports.uploadOfferImage = function(image_obj) {
	logger.log();
	var deferred = Q.defer();
	var content_type = getContentType(image_obj.image);
    var buff = new Buffer(image_obj.image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    if (!content_type) {
        deferred.reject({
            err: new Error("Invalid image type"),
            message: 'Image upload failed'
        });
    } else {
    	var upload_obj = {
    		Bucket: 'retwyst-merchants',
    		ACL: 'public-read',
    		ContentType: content_type,
    		Key: 'cashback-offers/partner/' + image_obj.id + '/' + 'logo',
    		Body: buff
    	};
    	logger.error(upload_obj);
    	AWSHelper.uploadImage(upload_obj)
    		.then(function(res) {
    			logger.error(res);
    			deferred.resolve({
    				data: {
    					id: image_obj.id,
    					key: 'logo'
    				},
    				message: 'Image uploaded successfully'
    			});
    		}, function(err) {
    			deferred.reject({
    				err: err,
    				message: 'Image upload Failed'
    			});
    		});
    }

	return deferred.promise;
}

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

module.exports.uploadPromoImage = function(image_obj) {
	logger.log();
	var deferred = Q.defer();
	var content_type = getContentType(image_obj.image);
	var buff = new Buffer(image_obj.image.replace(/^data:image\/\w+;base64,/, ""),'base64');
	
	if(!content_type) {
		deferred.reject({err: new Error("Invalid image type"), message: 'Image upload failed'});
	} 
	else if (image_obj.image_type=='push_notif') {
		uploadNotifImage(image_obj);
	} 
	else if (image_obj.image_type=='banner') {
		uploadBannerImage(image_obj);
	} 
	else {
		deferred.reject({
			err: new Error("Invalid request object"),
			message: "Invalid request object"
		});
	}

	function uploadNotifImage() {
		
		var img_obj = {
			Bucket: 'retwyst-app',
			ACL: 'public-read',
			ContentType: content_type,
			Key: 'push_notifications/'+ image_obj.id,
			Body: buff
		};
		AWSHelper.uploadImage(img_obj)
			.then(function(res) {
				deferred.resolve({data: {id: image_obj.id, key: image_obj.image_type}, message: "Image uploaded successfully"});
			}, function(err) {
				deferred.reject({err: err, message: 'Image upload failed'});
		});
		
	};

	function uploadBannerImage() {
		
		var img_obj = {
			Bucket: 'retwyst-app',
			ACL: 'public-read',
			ContentType: content_type,
			Key: 'banners/'+ image_obj.id,
			Body: buff
		};
		AWSHelper.uploadImage(img_obj)
			.then(function(res) {
				deferred.resolve({data: {id: image_obj.id, key: image_obj.image_type}, message: "Image uploaded successfully"});
			}, function(err) {
				deferred.reject({err: err, message: 'Image upload failed'});
		});
		
	};

	function uploadOtherImage(image_obj) {
		deferred.reject({err: new Error("Other image uploads currently restricted"), message: "Other image uploads currently restricted"});
	}

	return deferred.promise;
};