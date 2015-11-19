'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var MenuHelper = require('./helpers/menu.hlpr');
var _ = require('lodash');

module.exports.new = function(req, res) {
	logger.log();
	var token = req.query.token || null;
	var new_menu = {};

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	new_menu = _.extend(new_menu, req.body);
	MenuHelper.create_offer(token, new_menu).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err, err.message);
	})
}

module.exports.get = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		offer_id = req.params.offer_id;

	if(!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	MenuHelper.get_offer(token, offer_id).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err, err.message);
	})
}

module.exports.update = function(req, res) {
	logger.log();
	var token = req.query.token || null,
		offer_id = req.params.offer_id;

	if(!token) {
		HttpHelper.error(res, null, 'Not Authenticated');
	}
	var updated_offer = {};
	updated_offer = _.extend(updated_offer, req.body);

	MenuHelper.update_offer(token, updated_offer)
		.then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || true, err.message);
		})
}

module.exports.delete = function(req, res) {
    logger.log();
    var token = req.query.token || null,
    offer_id = req.params.offer_id;

    if(!token) {
        HttpHelper.error(res, null, "Not Authenticated");
    }

    MenuHelper.delete_offer(token, offer_id).then(function(data) {
        HttpHelper.success(res, data.data, data.message);
    }, function(err) {
        HttpHelper.error(res, err.err || true, err.message);
    });
}

module.exports.all = function(req, res) {
	logger.log();
	var token = req.query.token || null;

	if (!token) {
		HttpHelper.error(res, null, "Not Authenticated");
	}

	MenuHelper.get_all_offers(token).then(function(data) {
		HttpHelper.success(res, data.data, data.message);
	}, function(err) {
		HttpHelper.error(res, err.err || null, err.message);
	});

}