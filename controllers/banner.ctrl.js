'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var BannerHelper = require('./helpers/banner.hlpr');
var _ = require('lodash');

module.exports.create = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_banner = {};
	new_banner = _.extend(new_banner, req.body);

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		BannerHelper.create_banner(token, new_banner).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})
	}	
}

module.exports.get = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		banner = req.params.banner_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		BannerHelper.get_banner(token, banner).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})	
	}
	
}

module.exports.get_outlet_banner = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		banner = req.params.banner_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}
	else{
		BannerHelper.get_outlet_banner(req, banner).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err, err.message);
		})	
	}
	
}
module.exports.update = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		banner_id = req.params.banner_id;
	var updated_banner = {};
	updated_banner = _.extend(updated_banner, req.body);

	if(!token) {
		HttpHelper.error(res, null, 'Not Authenticated');
	}
	else{
		BannerHelper.update_banner(token, updated_banner)
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
    banner_id = req.params.banner_id,
    order = req.body.order;

    if(!token) {
        HttpHelper.error(res, null, "Not Authenticated");
    }
    else{
    	BannerHelper.delete_banner(token, banner_id).then(function(data) {
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
		BannerHelper.get_all_banners(token).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || null, err.message);
		});	
	}
}
