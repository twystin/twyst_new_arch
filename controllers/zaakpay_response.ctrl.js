'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var ChecksumHelper = require('./helpers/checksum.hlpr.js');
var HttpHelper = require('./helpers/http.hlpr.js');
var _ = require('underscore');

module.exports.get_zaakpay_response = function(req, res) {
	logger.log();
  	var zaakpay_response = {};
  	zaakpay_response = _.extend(zaakpay_response, req.body);
  	console.log(zaakpay_response);

  	ChecksumHelper.calculate_checksum(zaakpay_response).then(function(data){
		HttpHelper.success(res, data );
	},	function(err) {
		HttpHelper.error(res, err );
  	});
    
};