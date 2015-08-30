'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var async = require('async');
var AWSHelper = require('./helpers/aws.hlpr');
var ImageHlpr = require('./helpers/image.hlpr');
var HttpHelper = require('../common/http.hlpr');
var fs = require('fs');

/* Image size limits for various classes */
var image_sizes = {
	'logo': 0.2,
	'logo_gray': 0.2,
	'background': 1.0,
	'others': 5.0
};


/* dimentions for various image classes */
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
	width: 1028,
	height: 768
}, {
	size: '_lg',
	width: 1280,
	height: 1024
}];

/*============================================
=            Image upload handler            =
============================================*/

module.exports.uploadImage = function(req, res) {
	var img_obj = {
		bucketName: req.body.bucketName,
		image_path: req.files[0].path,
		image_for: req.body.image_for,
		image_class: req.body.image_class,
		ContentType: req.files[0].mimetype,
		folder_name: req.body.folder_name,
		size: req.files[0].size
	};
	var err;
	if((err = validateImage(img_obj))) {
		HttpHelper.error(res, err || null, 'Request object invalid');
	} else if(img_obj.image_for == 'outlet') {
		if(!_.has(image_sizes, [img_obj.image_class]) || (image_sizes[img_obj.image_class] <= (img_obj.size/1000000.0))) {
			fs.unlink(img_obj.image_path);
			HttpHelper.error(res, new Error("Image too big"), 'Image size must not exceed ' + image_sizes[img_obj.image_class] + ' MB');
		} else if (img_obj.image_class === 'others') {
			ImageHlpr.generateImages(img_obj.image_path, dimensions, function(err, images) {
				fs.unlink(img_obj.image_path);
				if(err) {
					HttpHelper.error(res, new Error("Unable to resize Image"), "Image resize error");
				} else {
					var key = {};
					var date = (new Date()).getTime();
					async.each(images, function(image, callback) {
						var upload_object = getUploadObject(img_obj, img_obj.folder_name + '/' + date + image.name, image.data);
						AWSHelper.uploadObject(upload_object, function(err, data) {
							if(err) {
								callback(err);
					  		} else {
					  			key[image.size] = date + image.name;
					  			callback();
							}
						});
					}, function(err) {
						if(err) {
							HttpHelper.error(res, new Error("Image upload error"), "Unable to upload image");
						} else {
							var data = {};
							data.key = key;
							HttpHelper.success(res, data, "Image uploaded successfully");
						}
					});
				}
			});
		} else {
			fs.readFile(img_obj.image_path, function(err, file_data) {
				fs.unlink(img_obj.image_path);
				if(err) {
					HttpHelper.error(res, null, "Error reading the image content");
				} else {
					var upload_object = getUploadObject(img_obj, img_obj.folder_name + '/' + img_obj.image_class, file_data);

					AWSHelper.uploadObject(upload_object, function(err, data) {
						if(err) {
							HttpHelper.error(res, err || null, 'Unable to upload the image at the moment');
						} else {
							data = data || {};
							data.key = img_obj.image_class;
							HttpHelper.success(res, data, 'Image upload successfully');
						}
					});
				}
			});
		}
	} else {
		HttpHelper.error(res, new Error("Other image uploads temporarily restrained") || null, 'Other image uploads temporarily restrained');
	}

	/*==========  Validate image data and meta fields   ==========*/
	function validateImage() {
		if(!_.has(img_obj, 'image_path'))
			return 'Valid image path required';
		else if(!_.has(img_obj, 'folder_name'))
			return 'Valid folder name required';
		else if(!_.has(img_obj, 'bucketName'))
			return 'Valid bucket name required';
		else if(!_.has(img_obj, 'image_for'))
			return 'Valid image for required'
		else if(!_.has(img_obj, 'image_class'))
			return 'Valid image class required'
		else if(!_.has(img_obj, 'ContentType') || !_.contains(["image/jpeg", "image/png"], img_obj.ContentType))
			return 'Image type unknown/invalid';
		else
			return null;
	};

};


/*=========================================
=            Get Upload Object            =
=========================================*/
function getUploadObject(image_object, image_name, image_data) {
	return {
		ACL: 'public-read',
		Bucket: image_object.bucketName,
		ContentType: image_object.ContentType,
		Key: image_name,
		Body: image_data
	};
};


