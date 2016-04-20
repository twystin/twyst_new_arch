'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var CashbackCouponHelper = require('./helpers/cashback_coupon.hlpr');
var _ = require('lodash');

module.exports.create = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_offer = {};
	new_offer = _.extend(new_offer, req.body);

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		CashbackCouponHelper.create_cashback_coupon(token, new_offer).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})
	}	
}

module.exports.get = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		offer_id = req.params.offer_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		CashbackCouponHelper.get_cashback_coupon(token, offer_id).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})	
	}
	
}

module.exports.update = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		offer_id = req.params.offer_id;
	var updated_offer = {};
	updated_offer = _.extend(updated_offer, req.body);

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
    offer_id = req.params.offer_id,
    order = req.body.order;

    if(!token) {
        HttpHelper.error(res, null, "Not Authenticated");
    }
    else{
    	CashbackCouponHelper.delete_cashback_coupon(token, offer_id).then(function(data) {
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