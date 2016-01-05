'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var PaymentHelper = require('./helpers/payment.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var xml = require('xml');

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
		var orderId = order_form.orderd;
		var message = "'"+mid+"''"+amount+"''"+orderd+"'";		
	}
	else if(order_form.pgName === 'zaakpay') {
		var message = 'test'
	}
	

	
	console.log(message);

	PaymentHelper.calculate_checksum(message, order_form.pgName).then(function(data){
		var calculated_checksum = data.calculated_checksum;
		var checksum = {};
		checksum.status  = 'SUCCESS';
		checksum.checksumValue = calculated_checksum;
			
		HttpHelper.success(res, xml(checksum) );
	},	function(err) {
		HttpHelper.error(res, err );
  	});
}