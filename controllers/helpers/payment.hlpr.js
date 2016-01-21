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
		deferred.reject('request not valid');	
	}
	
	console.log(message);
	if(message && key) {
		var checksum = crypto.createHmac('sha256', key).update(message).digest('hex');
		deferred.resolve(checksum);
	}
	else{
		deferred.reject('not a valid request');	
	}
	return deferred.promise;
	
};

module.exports.process_refund = function(order) {
	logger.log();
	var deferred = Q.defer();
	
	var checksum;
	if(order.refund_mode === 'Zaakpay') {
		var merchantIdentifier = '4884e5a14ab742578df520b5203b91e6';
	    var orderId = order.order_number;
	    var mode = 0;
	    var updateDesired = order.updateDesired;
	    var updateReason = order.updateReason;
	    var amount = order.amount;

	    message = "'"+merchantIdentifier+"''"+orderId+"''"+amount+"''"+mode+"''"+updateDesired+"''"+updateReason+"'";
		checksum = calculate_checksum(message, 'Zaakpay');
	}
	else if(order.refund_mode === 'mobikwik') {
		var merchantIdentifier = '4884e5a14ab742578df520b5203b91e6';
	    var orderId = order.order_number;
	    var mode = 0;
	    var updateDesired = order.updateDesired;
	    var updateReason = order.updateReason;
	    var amount = order.amount;

	    message = "'"+merchantIdentifier+"''"+orderId+"''"+amount+"''"+mode+"''"+updateDesired+"''"+updateReason+"'";
		checksum = calculate_checksum(message, 'mobikwik');
	}
	else{
		deferred.reject('unkwnown refund mode');
	}
	

	var form = {
        merchantIdentifier: merchantIdentifier,
        orderId: order.order_number,
        amount: order.amount,
        mode: 0,
        updateDesired: order.updateDesired,
        updateReason: order.updateReason,
        checksum: data

    }

    request.post({url: update_url, form: form},function(err, httpResponse, body){
        console.log(body);
        deferred.resolve(data);    
    });
	return deferred.promise;
	
};
