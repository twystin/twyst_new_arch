'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var async = require('async');
var AWSHelper = require('./helpers/aws.hlpr');
var fs = require('fs');


/*============================================
=            Image upload handler            =
============================================*/

module.exports.uploadImage = function(image_obj) {
	logger.log();
    var deferred = Q.defer();
	var img_obj = {
		bucketName: image_obj.bucketName,
		image: img_obj.image
	};

		
	AWSHelper.uploadObject(img_obj, function(err, data) {
		if(err) {
			logger.error("AWS error --> ", err);
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
		
	

};

