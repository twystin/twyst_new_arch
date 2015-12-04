'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var OrderHelper = require('./helpers/order.hlpr');
var _ = require('lodash');

module.exports.verify_order = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_order = {};

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	new_order = _.extend(new_order, req.body);

	OrderHelper.verify_order(token, new_order).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err, err.message);
	})
}

module.exports.apply_offer = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var offer = req.body.offer;
	var order = req.body.order;
	var outlet = req.body.outlet;

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	OfferHelper.apply_offer(order, offer, outlet).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err || null, err.message);
	});

}

module.exports.checkout = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var order = req.body.order;
	var outlet = req.body.outlet;

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	OfferHelper.checkout(order, outlet).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	});
}



