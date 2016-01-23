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
  	if(zaakpay_response.paymentMethod) { // for zaakpay
		var orderId = zaakpay_response.orderId;
		var responseCode = zaakpay_response.responseCode;		
		var responseDescription = zaakpay_response.responseDescription;
		var amount = zaakpay_response.amount*100;
		var paymentMethod = zaakpay_response.paymentMethod;
		var cardhashid = zaakpay_response.cardhashid;
		type = 'Zaakpay';

		message = "'"+orderId+"''"+responseCode+"''"+responseDescription+"''"
		+amount+"''"+paymentMethod+"''"+cardhashid+"'";		
  	}
  	else{// for mobikwik
  		var orderId = zaakpay_response.orderid;
		var responseCode = zaakpay_response.responseCode;		
		var responseDescription = zaakpay_response.responseDescription;
		var amount = zaakpay_response.amount;
		type = 'wallet';
				
		message = "'"+orderId+"''"+amount+"''"+responseCode+"''"
		+responseDescription+"'";			
  	}

  	PaymentHelper.calculate_checksum(message, type).then(function(checksum){
  		if(checksum === zaakpay_response.checksum) {
  			var data = {};
  			data.order_number = zaakpay_response.orderId;
  			Order.findOne({order_number: data.order_number}).exec(function(err, order) {
		        if (err) {
		          console.log(err);
		        } 
		        else {
		        	data.outlet = order.outlet;
		        	if(zaakpay_response.paymentMethod) {
		        		data.payment_mode = zaakpay_response.paymentMethod;
		        		data.cardhashid = zaakpay_response.cardhashid;
		        	}
		        	else{
		        		data.payment_mode = 'mobikwik';
		        	}
		        	OrderHelper.confirm_order(data).then(function(data){
		  				HttpHelper.success(res, checksum, 'order confirmed');	
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
		var txnDate = moment().format('YYYY-MM-DD');
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

	if (!token) {
		HttpHelper.error(res, null, "Not authenticated");
	}
	else if (!order_id) {
		HttpHelper.error(res, null, "could not process without order id");
	}
	else if (!req.body.refund_type) {
		HttpHelper.error(res, null, "could not process without refund type");
	}
	else if (!req.body.reason) {
		HttpHelper.error(res, null, "could not process without refund reason");
	}

	var passed_order = {};
	passed_order.order_id = req.body.order_id;
	passed_order.updateReason = req.body.reason;
	if(req.body.refund_type === 'full_refund') {
		passed_data.updateDesired = 14;
	}
	else if(req.body.refund_type === 'partial_refund'){
		passed_data.updateDesired = 22;
		passed_order.amount = req.body.amount;	
	}

	Order.findOne({_id: order.order_id}).exec(function(err, order) {
        if (err) {
          console.log(err);
        }
        else if(!order) {
        	HttpHelper.error(res, null, 'could not found order id' );	
        }
        else if(order.status != 'cancelled' && order.payment_info && order.payment_info.payment_mode === 'Zaakpay'){
        	passed_order.refund_mode = 'Zaakpay';
        	passed_order.order_number = order.order_number; 

    		PaymentHelper.process_refund(passed_order).then(function(data){
    			HttpHelper.success(res, 'refund processed');	
    		}, function(err) {
			    HttpHelper.error(res, err, 'could not process refund');
			 });	        
        }
        else if(order.status != 'cancelled' && order.payment_info && order.payment_info.payment_mode === 'mobikwik'){
        	passed_order.refund_mode = 'Zaakpay';
        	passed_order.order_number = order.order_number;

        	PaymentHelper.process_refund(passed_order).then(function(data){

    		})	
        			        
        }
        else{
        	HttpHelper.error(res, null, 'could not process  refund against this order id' );	
        }
    });
	
}