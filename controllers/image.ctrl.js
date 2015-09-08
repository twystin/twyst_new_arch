'use strict';
/*jslint node: true */

var ObjectId = require('mongoose').Types.ObjectId;
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