'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var RechargeHelper = require('./helpers/recharge.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');

module.exports.send_recharge_request = function(req, res) {
	logger.log();
	var recharge_req = {};
	recharge_req = _.extend(recharge, req.body);

	if (!token) {
		HttpHelper.error(res, null, "Not authenticated");
	}
	else if (!req.body.phone) {
		HttpHelper.error(res, null, "could not process without phone number");
	}
	else if (!req.body.amount) {
		HttpHelper.error(res, null, "could not process without amount");
	}
	else{
		
		RechargeHelper.send_recharge_request(token, recharge_req).then(function(data) {
	      HttpHelper.success(res, data.data, data.message);
	    }, function(err) {
	      HttpHelper.error(res, err.data, err.message);
	    });
	    
	}
}

