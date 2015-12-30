'use strict';
/*jslint node: true */
var crypto = require("crypto");
var Q = require('q');
var logger = require('tracer').colorConsole();

module.exports.calculate_checksum = function(message) {
	logger.log();
	
	var key = 'be92fd65d03d43bc83a5aaeffdcd709f';
	var checksum = crypto.createHmac('sha256', key).update(message).digest('hex')
	return checksum;
	
};
