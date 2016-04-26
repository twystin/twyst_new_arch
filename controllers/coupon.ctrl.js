'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var CashbackCouponHelper = require('./helpers/coupon.hlpr');
var _ = require('lodash');

module.exports.create = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_coupon = {};
	console.log("coupon request", req.body);	
	new_coupon = _.extend(new_coupon, req.body);
	console.log("new coupon",new_coupon);
	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		CashbackCouponHelper.create_cashback_coupon(token, new_coupon).then(function(data) {
			console.log(data);
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})
	}
}

module.exports.get = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		coupon_id = req.params.coupon_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		CashbackCouponHelper.get_cashback_coupon(token, coupon_id).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})
	}

}

module.exports.update = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		coupon_id = req.params.coupon_id;
	var updated_coupon = {};
	updated_coupon = _.extend(updated_coupon, req.body);

	if(!token) {
		HttpHelper.error(res, null, 'Not Authenticated');
	}
	else{
		CashbackCouponHelper.update_cashback_coupon(token, updated_offer)
		.then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || true, err.message);
		})
	}


}

module.exports.delete = function(req, res) {
    logger.log();
    var token = req.query.token || null,
    coupon_id = req.params.coupon_id;

    if(!token) {
        HttpHelper.error(res, null, "Not Authenticated");
    }
    else{
    	CashbackCouponHelper.delete_cashback_coupon(token, coupon_id).then(function(data) {
	        HttpHelper.success(res, data.data, data.message);
	    }, function(err) {
	        HttpHelper.error(res, err.err || true, err.message);
	    });
    }

}

module.exports.all = function(req, res) {
	logger.log();
	var token = req.query.token || null;

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		CashbackCouponHelper.get_all_cashback_coupons(token).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || null, err.message);
		});
	}
}

module.exports.get_outlet_coupon = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		coupon = req.params.coupon_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		CashbackCouponHelper.get_outlet_coupon(req, coupon).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})
	}

}
