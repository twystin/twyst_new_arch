'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr');
var OfferHelper = require('./helpers/offer.hlpr');
var _ = require('lodash');

module.exports.new = function(req, res) {
	var token = req.query.token || null;
	var new_offer = {};

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	new_offer = _.extend(new_offer, req.body);
	OfferHelper.create_offer(token, new_offer).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.data, err.message);
	})
}