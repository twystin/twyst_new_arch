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
		var orderId = zaakpay_response.orderid;
		var responseCode = zaakpay_response.responseCode;		
		var responseDescription = zaakpay_response.responseDescription;
		var amount = zaakpay_response.amount*100;
		var paymentMethod = zaakpay_response.paymentMethod;
		var cardhasid = zaakpay_response.cardhasid;
		type = 'Zaakpay';

		message = "'"+orderId+"''"+responseCode+"''"+responseDescription+"''"
		+amount+"''"+paymentMethod+"''"+cardhasid+"'";		
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
		        		data.cardhasid = zaakpay_response.cardhasid;
		        	}
		        	else{
		        		data.payment_mode = 'mobikwik';
		        	}
		        	OrderHelper.confirm_order(data).then(function(data){
		  				HttpHelper.success(res, checksum);	
		  			})		        
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