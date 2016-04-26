'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var PromoNotifHelper = require('./helpers/promo_notif.hlpr');
var _ = require('lodash');

module.exports.create = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_notif = {};
	new_notif = _.extend(new_notif, req.body);

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		PromoNotifHelper.create_promo_notif(token, new_notif).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})
	}	
}

module.exports.get = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		promo_notif_id = req.params.promo_notif_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		PromoNotifHelper.get_promo_notif(token, promo_notif_id).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})	
	}
	
}

module.exports.update = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		promo_notif_id = req.params.promo_notif_id;
	var updated_promo_notif = {};
	updated_promo_notif = _.extend(updated_promo_notif, req.body);

	if(!token) {
		HttpHelper.error(res, null, 'Not Authenticated');
	}
	else{
		PromoNotifHelper.update_promo_notif(token, updated_offer)
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
    promo_notif_id = req.params.promo_notif_id;

    if(!token) {
        HttpHelper.error(res, null, "Not Authenticated");
    }
    else{
    	PromoNotifHelper.delete_promo_notif(token, promo_notif_id).then(function(data) {
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
		PromoNotifHelper.get_all_promo_notifs(token).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || null, err.message);
		});	
	}	
}

module.exports.get_outlet_promo_notif = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		coupon = req.params.promo_notif_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		PromoNotifHelper.get_outlet_promo_notif(req, coupon).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})	
	}
	
}

module.exports.send_notif = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var outlet = req.body.outlet;
	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		PromoNotifHelper.send_notif(req, outlet).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})	
	}
	
}
