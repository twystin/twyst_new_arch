'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var PaymentHelper = require('./helpers/payment.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var xml = require('xml');
var moment = require('moment');

module.exports.get_zaakpay_response = function(req, res) {
	logger.log();
  	var zaakpay_response = {};
  	zaakpay_response = _.extend(zaakpay_response, req.body);
  	console.log(zaakpay_response);

  	PaymentHelper.calculate_checksum(zaakpay_response).then(function(data){
		HttpHelper.success(res, data );
	},	function(err) {
		HttpHelper.error(res, err );
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
		var amount = order_form.amount;
		var currency = order_form.currency*100;
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