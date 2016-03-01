'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var PaymentHelper = require('./helpers/paytm_payment.hlpr.js');
var OrderHelper = require('./helpers/order.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var xml = require('xml');
var moment = require('moment');
var mongoose = require('mongoose');
var Order = mongoose.model('Order');


module.exports.calculate_checksum = function(req, res) {
	logger.log();
	HttpHelper.success(res, 'resonse recieved successfully');
}

module.exports.get_paytm_response = function(req, res) {
	logger.log();
  	var paytm_response = {};
  	paytm_response = _.extend(paytm_response, req.body);
  	console.log(paytm_response);

  	HttpHelper.success(res, 'resonse recieved successfully');
}