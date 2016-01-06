'use strict';
/*jslint node: true */
var crypto = require("crypto");
var Q = require('q');
var logger = require('tracer').colorConsole();

module.exports.calculate_checksum = function(message, type) {
	logger.log();
	var deferred = Q.defer();
	
	var key;
	if(type === 'wallet') {
		key = 'gbzbj7859G6STy3zyzL4gj4AEuaF';
	}
	else if(type === 'Zaakpay'){
		key = 'be92fd65d03d43bc83a5aaeffdcd709f';	
	}
	else{
		deferred.resolve('not valid');	
	}
	console.log(message);
	console.log(type);
	console.log(key);
	if(message && key) {
		var checksum = crypto.createHmac('sha256', key).update(message).digest('hex');
		deferred.resolve(checksum);
	}
	else{
		deferred.reject('not a valid request');	
	}
	return deferred.promise;
	
};
