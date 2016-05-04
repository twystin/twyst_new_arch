'use strict';
/*jslint node: true */
var crypto = require("crypto");
var Q = require('q');
var logger = require('tracer').colorConsole();
var zaakpay_refund_url = 'https://api.zaakpay.com/updatetransaction';
var mobikwik_refund_url = 'https://www.mobikwik.com/walletrefund?';
var request = require('request');
var rest = require('restler');

var calculate_checksum = module.exports.calculate_checksum = function(message, type) {
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
	
	var form = {}, update_url;
	if(order.refund_mode === 'Zaakpay') {
		console.log('prcessing refund for zaakpay');
		var merchantIdentifier = '4884e5a14ab742578df520b5203b91e6';
	    var orderId = order.order_number;
	    var mode = 0;
	    var updateDesired = order.updateDesired;
	    var updateReason = order.updateReason;
	    var amount;
	    if(updateDesired === 22) {
	    	amount = order.amount;	
	    }
	    
		if(updateDesired === 22) {
			var message = "'"+merchantIdentifier+"''"+orderId+"''"+amount+"''"+mode+"''"+updateDesired+"''"+updateReason+"'";
			calculate_checksum(message, 'Zaakpay').then(function(data){
				form = {
			        merchantIdentifier: merchantIdentifier,
			        orderId: order.order_number,
			        amount: amount,
			        mode: 0,
			        updateDesired: order.updateDesired,
			        updateReason: order.updateReason,
			        checksum: data

			    }
		
			    request.post({url: zaakpay_refund_url, form: form},function(err, httpResponse, body){
			        console.log(body);
			        deferred.resolve(order);    
			    });
			})
		}
		else if(updateDesired === 14) {
			var message = "'"+merchantIdentifier+"''"+orderId+"''"+mode+"''"+updateDesired+"''"+updateReason+"'";
			calculate_checksum(message, 'Zaakpay').then(function(data){
				form = {
			        merchantIdentifier: merchantIdentifier,
			        orderId: order.order_number,
			        mode: 0,
			        updateDesired: order.updateDesired,
			        updateReason: order.updateReason,
			        checksum: data
			    }
		
			    request.post({url: zaakpay_refund_url, form: form},function(err, httpResponse, body){			        
			        console.log(body);
			        deferred.resolve(order);    
			    });
			})
		}
		else{
			deferred.reject({
                err: err || true,
                data: null,
                message: 'unkwnown updateDesired for zaakpay'
            });
		}
	}
	else if(order.refund_mode === 'wallet') {
		console.log('prcessing refund for wallet');
		var mid = 'MBK2136';
	    var orderId = order.order_number;
		var amount = order.amount;
		if(order.refund_type === 'partial_refund') {
			console.log('prcessing partial refund');
			var message = "'"+mid+"''"+orderId+"''"+amount+"'";
			calculate_checksum(message, 'wallet').then(function(data){
					    
			    request.get(mobikwik_refund_url + "mid="+mid+"&txid="+orderId+"&amount="+amount+"&ispartial=yes&checksum="+data, function(err, res, body){
			    	console.log(body);
			    	deferred.resolve(order);
			    })			
			})
	 	}
	 	else if(order.refund_type === 'full_refund'){
	 		console.log('prcessing full refund');
	 		var message = "'"+mid+"''"+orderId+"''"+amount+"'";
			calculate_checksum(message, 'wallet').then(function(data){
				 
			    request.get(mobikwik_refund_url + "mid="+mid+"&txid="+orderId+"&amount="+amount+"&checksum="+data, function(err, res, body){
			    	console.log(body);
			    	deferred.resolve(order);
			    })
			})			
	 	}
	 	else{
	 		deferred.reject({
                err:  true,
                data: null,
                message: 'unkwnown refund mode'
            });
	 	}

	}
	else{
		deferred.reject({
            err:  true,
            data: null,
            message: 'unkwnown refund mode'
        });
	}
	return deferred.promise;	
};
