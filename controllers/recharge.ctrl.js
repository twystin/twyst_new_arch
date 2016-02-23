'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');

module.exports.send_recharge_request = function(req, res) {
	logger.log();
	res.send('not implemented yet');
};

