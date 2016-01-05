'use strict';
/*jslint node: true */
var crypto = require("crypto");
var Q = require('q');
var logger = require('tracer').colorConsole();

module.exports.calculate_checksum = function(message, type) {
	logger.log();
	var deferred = Q.defer();
	if(type === 'wallet') {
		var key = 'gbzbj7859G6STy3zyzL4gj4AEuaF';
	}
	else{
		var key = 'be92fd65d03d43bc83a5aaeffdcd709f';	
	}
	
	var checksum = crypto.createHmac('sha256', key).update(message).digest('hex')
	data.calculated_checksum = checksum;
	deferred.resolve(data);
	return deferred.promise;
	
};
