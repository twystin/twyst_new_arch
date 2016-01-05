'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var PaymentHelper = require('./helpers/payment.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');

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
	var merchantIdentifier = req.body.merchantIdentifier;
	var orderId = req.body.orderId;
	var returnUrl = 'http://staging.twyst.in/api/v4/zaakpay_response';
	var buyerEmail = req.body.buyerEmail;
	var buyerFirstName = req.body.buyerFirstName;
	var buyerLastName = req.body.buyerLastName;
	var buyerAddress = req.body.buyerAddress;
	var buyerCity = req.body.buyerCity;
	var buyerState = req.body.buyerState;
	var buyerCountry = req.body.buyerCountry;
	var buyerPincode = req.body.buyerPincode;
	var buyerPhoneNumber = req.body.buyerPhoneNumber;
	var txnType = req.body.txnType;
	var zpPayOption = req.body.zpPayOption;
	var mode = req.body.mode;
	var currency = req.body.currency;
	var amount = req.body.amount;
	var merchantIpAddress = req.body.merchantIpAddress;
	var txnDate = req.body.txnDate;
	var purpose = req.body.purpose;
	var productDescription = req.body.productDescription;

	var message = "'"+merchantIdentifier+"''"+orderId+"''"+returnUrl+"''"+buyerEmail
	+"''"+buyerFirstName+"''"+buyerLastName+"''"+buyerAddress+"''"+buyerCity
	+"''"+buyerState+"''"+buyerCountry+"''"+buyerPincode+"''"+buyerPhoneNumber+"''"+txnType
	+"''"+zpPayOption+"''"+mode+"''"+currency+"''"+amount+"''"+merchantIpAddress+"''"+txnDate
	+"''"+purpose+"''"+productDescription+"'";
	console.log(message);

	PaymentHelper.calculate_checksum(message).then(function(data){
		HttpHelper.success(res, data );
	},	function(err) {
		HttpHelper.error(res, err );
  	});
}