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
	else if(!order.order_number) {
		HttpHelper.error(res, null, "could not process without order number");	
	}
	else if(!order.outlet){
		HttpHelper.error(res, null, "could not process without outlet");	
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
	else if(!order.order_number) {
		HttpHelper.error(res, null, "could not process without order number");	
	}
	else if(!order.outlet){
		HttpHelper.error(res, null, "could not process without outlet");	
	}
	else if(!order.address){
		HttpHelper.error(res, null, "could not process without address");	
	}

	OrderHelper.checkout(token, order).then(function(data) {
		HttpHelper.success(res, data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	});
}

module.exports.confirm_order = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var order = {};
	order = _.extend(order, req.body);

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else if(!order.order_number) {
		HttpHelper.error(res, null, "could not process without order number");	
	}
	else if(!order.outlet) {
		HttpHelper.error(res, null, "could not process without outlet");	
	}
	else if(!order.payment_mode) {
		HttpHelper.error(res, null, "could not process without payment mode");	
	}

	OrderHelper.confirm_order(token, order).then(function(data) {
		HttpHelper.success(res, data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	});
}

module.exports.get_order = function(req, res) {
  var token = req.query.token || null;
  var order_id = req.params.order_id;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  OrderHelper.get_order(token, order_id).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.all = function(req, res) {
	var token = req.query.token || undefined;

	if (!token) {
		HttpHelper.error(res, null, "Not authenticated");
	}

	OrderHelper.get_orders(token).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.data, err.message);
	});
}


