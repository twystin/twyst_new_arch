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
		HttpHelper.success(res, data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err, err.message);
	})
}

module.exports.apply_offer = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var order = {};
	order = _.extend(order, req.body);

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	OrderHelper.apply_offer(token, order).then(function(data) {
		HttpHelper.success(res, data, data.message);
	}, function(err) {
		HttpHelper.error(res, err || null, err.message);
	});

}

module.exports.checkout = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var order = {};
	order = _.extend(order, req.body);

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	OrderHelper.checkout(token, order).then(function(data) {
		HttpHelper.success(res, data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	});
}

module.exports.update_order = function(req, res) {
  var token = req.query.token || null;
  var updated_order = {};
  updated_order = _.extend(updated_order, req.body);

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  OrderHelper.update_order(token, updated_order).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.cancel_order = function(req, res) {
  var token = req.query.token || null;
  var order = {};
  order = _.extend(order, req.body);

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  OrderHelper.cancel_order(token, order).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};




