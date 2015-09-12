'use strict';
/*jslint node: true */

var _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;
var ImageHelper = require('./helpers/image.hlpr');
var AWSHelper = require('./helpers/aws.hlpr');
var HttpHelper = require('../common/http.hlpr');


/*============================================
=            Image upload handler            =
============================================*/

module.exports.uploadImage = function(req, res) {
	var img_obj = {
		id: req.body.id || ObjectId(),
		image: req.body.image || ''
	}
	if(!img_obj.id || !img_obj.image) {
		HttpHelper.error(res, null, "Request object invalid.");
	} else {
		AWSHelper.uploadObject(img_obj, function(err, url) {
			if(err || !url) {
				HttpHelper.error(res, err || null, "File upload Failure");
			} else {
				HttpHelper.success(res, { id: img_obj.id, url: url }, "Image uploaded successfully");
			}
		})
	}
}

module.exports.uploadImage = function(req, res) {
	if(!_.has(req.body, 'image_class')) {
		HttpHelper.error(res, new Error("Invalid request object"), "Invalid request object");
	} else if (req.body.image_class=='outlet') {
		ImageHelper.uploadOutletImage(req, res)
			.then(function(data) {
				HttpHelper.success(res, data.data, data.message);
			}, function(err) {
				HttpHelper.error(res, err.err || null, err.message);
			});
	} else if (req.body.image_class=='bill') {
		HttpHelper.error(res, new Error("Other image uploads currently restricted"), "Other image uploads currently restricted");
	} else {
		HttpHelper.error(res, new Error("Invalid request object"), "Invalid request object");
	}
}