'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var PaymentHelper = require('./helpers/payment.hlpr.js');
var OrderHelper = require('./helpers/order.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var xml = require('xml');
var moment = require('moment');
var mongoose = require('mongoose');
var Order = mongoose.model('Order');

module.exports.get_zaakpay_response = function(req, res) {
	logger.log();
  	var zaakpay_response = {};
  	zaakpay_response = _.extend(zaakpay_response, req.body);
  	console.log(zaakpay_response);
  	var message, type;
  	if(zaakpay_response.paymentMethod.charAt(0) === 'N' || zaakpay_response.paymentMethod.charAt(0) === 'C') { // for zaakpay
		var orderId = zaakpay_response.orderId;
		var responseCode = zaakpay_response.responseCode;		
		var responseDescription = zaakpay_response.responseDescription;
		var amount = zaakpay_response.amount;
		var paymentMethod = zaakpay_response.paymentMethod;
		var cardhashid = zaakpay_response.cardhashid;
		type = 'Zaakpay';

		message = "'"+orderId+"''"+responseCode+"''"+responseDescription+"''"
		+amount+"''"+paymentMethod+"''"+cardhashid+"'";		
  	}
  	else if(zaakpay_response.paymentMethod === 'wallet'){// for mobikwik
  		var orderId = zaakpay_response.orderId;
		var responseCode = zaakpay_response.responseCode;		
		var responseDescription = zaakpay_response.responseDescription;
		var amount = zaakpay_response.amount;
		type = 'wallet';
				
		message = "'"+orderId+"''"+amount+"''"+responseCode+"''"
		+responseDescription+"'";			
  	}
  	
  	if(zaakpay_response.responseCode === '0' || zaakpay_response.responseCode === '100') {
  		PaymentHelper.calculate_checksum(message, type).then(function(checksum){
	  		if(checksum === zaakpay_response.checksum) {
	  			console.log('checksum verified');
	  			var data = {};
	  			data.order_number = zaakpay_response.orderId;
	  			Order.findOne({
	  				order_number: data.order_number
	  			}).populate('outlet user').exec(function(err, order) {
			        if (err || !order) {
			          console.log(err);
			          console.log('order not found');

			        } 
			        else {
			        	data.outlet = order.outlet;
			        	data.user = order.user;
			        	data.order = order;
			        	data.card_id = cardhashid;
			        	data.payment_mode = zaakpay_response.paymentMethod;

			        	if(zaakpay_response.paymentMethod === 'Zaakpay') {		       
			        		data.cardhashid = zaakpay_response.cardhashid;
			        	}
			        	
			        	OrderHelper.confirm_inapp_order(data).then(function(data){
			        		var response = [{paymentResponse: [{orderid: order.order_number}, 
			        		{amount: order.actual_amount_paid}, {status: zaakpay_response.responseCode},
			        		{statusMsg: zaakpay_response.responseDescription}]}];		
			  				response = xml(response);		
							res.send(response);
			  			},	function(err) {
							HttpHelper.error(res, err);
					  	});		        
			        }
			    });
	  		}
	  		else{
	  			console.log('fraud detected');
	  			HttpHelper.error(res, 'checsum not valid');
	  		}
		},	function(err) {
			HttpHelper.error(res, err);
	  	});	
  	}
  	else{
  		var response = [{paymentResponse: [{orderid: order.order_number}, 
		{amount: order.actual_amount_paid}, {status: zaakpay_response.responseCode},
		{statusMsg: zaakpay_response.responseDescription}]}];		
		response = xml(response);		
		res.send(response);
  	}    
};

module.exports.calculate_checksum = function(req, res) {
	logger.log();
	var order_form = {};
	order_form = _.extend(order_form, req.body);
	console.log(order_form);
	var message;
	
	if(order_form.pgName === 'wallet') {
		var mid = order_form.mid;
		var amount = order_form.amount;
		var orderId = order_form.orderid;
		message = "'"+amount+"''"+orderId+"''"+mid+"'";		
	}
	else if(order_form.pgName === 'Zaakpay') {
		var ipAddr = order_form.ipAddr;
		var amount = order_form.amount*100;
		var currency = order_form.currency;
		var mid = order_form.mid;
		var orderId = order_form.orderid;
		var txnDate = moment().add(5, 'hours').add(30, 'minutes').format('YYYY-MM-DD');
		console.log(txnDate);
		var mode = 0;
		message = "'"+amount+"''"+ipAddr+"''"+txnDate+"''"
		+currency+"''"+mid+"''"+orderId+"''"+mode+"'";	

	}

	PaymentHelper.calculate_checksum(message, order_form.pgName).then(function(data){
		var checksum = [{checksum: [{status: 'SUCCESS'}, {checksumValue: data}]}];		
		var data = xml(checksum);		
		res.send(data);
	},	function(err) {
		HttpHelper.error(res, err );
  	});
}

module.exports.initiate_refund = function(req, res) {
	logger.log();

	var token = req.query.token || null;
	var passed_order = {};
	passed_order.order_id = req.body.order_id;
	passed_order.updateReason = req.body.reason;
	passed_order.refund_type = req.body.refund_type;

	if (!token) {
		HttpHelper.error(res, null, "Not authenticated");
	}
	else if (!req.body.order_id) {
		HttpHelper.error(res, null, "could not process without order id");
	}
	else if (!req.body.refund_type) {
		HttpHelper.error(res, null, "could not process without refund type");
	}
	else if (!req.body.reason) {
		HttpHelper.error(res, null, "could not process without refund reason");
	}
	else{
		Order.findOne({_id: passed_order.order_id}).exec(function(err, order) {
	        if (err) {
	          console.log(err);
	          HttpHelper.error(res, null, 'could not process refund against this order id' );	
	        }
	        else if(!order) {
	        	HttpHelper.error(res, null, 'could not found order id' );	
	        }
	        else if(order.status != 'cancelled' && order.status != 'pending' && order.payment_info
	         && order.payment_info.is_inapp && order.payment_info.payment_mode === 'Zaakpay'){
	        	passed_order.refund_mode = 'Zaakpay';
	        	passed_order.order_number = order.order_number;
	        	if(passed_order.refund_type === 'full_refund') {
					passed_order.updateDesired = 14;
					passed_order.amount = order.actual_amount_paid;
				}
				else if(passed_order.refund_type === 'partial_refund'){
					passed_order.updateDesired = 22;
					passed_order.amount = req.body.amount;	
				}
	        	PaymentHelper.process_refund(passed_order).then(function(data){
					HttpHelper.success(res, 'refund processed');	
				}, function(err) {
				    HttpHelper.error(res, err, 'could not process refund');
				});        
	        }
	        else if(order.status != 'cancelled' && order.status != 'pending' && order.payment_info
	         && order.payment_info.is_inapp && order.payment_info.payment_mode === 'wallet'){
	        	passed_order.refund_mode = 'wallet';
	        	passed_order.order_number = order.order_number;
	        	if(passed_order.refund_type === 'full_refund') {
					passed_order.amount = order.actual_amount_paid;
				}
				else{
					passed_order.amount = req.body.amount;	
				}
				
	        	PaymentHelper.process_refund(passed_order).then(function(data){
					HttpHelper.success(res, 'refund processed');	
				}, function(err) {
				    HttpHelper.error(res, err, 'could not process refund');
				});		        
	        }
	        else{
	        	console.log(order)
	        	HttpHelper.error(res, null, 'could not process refund against this order id' );	
	        }
	    });
	}	
}

module.exports.get_paytm_response = function(req, res) {
	logger.log();
  	var paytm_response = {};
  	paytm_response = _.extend(paytm_response, req.body);
  	console.log(paytm_response);

  	HttpHelper.success(res, 'resonse recieved successfully');
}