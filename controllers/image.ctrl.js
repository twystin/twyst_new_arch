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
	if(!_.has(req.body, 'image_class') || !_.has(req.body, 'image_type') || !_.has(req.body, 'image')) {
		HttpHelper.error(res, new Error("Invalid request object"), "Invalid request object");
	} 
	else if (req.body.image_class =='outlet') {
		
		var img_obj = {};
		img_obj.id = req.body.id || new ObjectId();
		img_obj.image = req.body.image;
		img_obj.image_type = req.body.image_type;

		ImageHelper.uploadOutletImage(img_obj).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, 
		function(err) {
			HttpHelper.error(res, err.err || null, err.message);
		});	
		
	} 
	else {
		HttpHelper.error(res, new Error("Invalid request object"), "Invalid request object");
	}
}