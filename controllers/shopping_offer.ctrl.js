'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var ShoppingOfferHelper = require('./helpers/shopping_offer.hlpr');
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
		ShoppingOfferHelper.create_shopping_offer(token, new_offer).then(function(data) {
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
		ShoppingOfferHelper.get_shopping_offer(token, offer_id).then(function(data) {
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
		ShoppingOfferHelper.update_shopping_offer(token, updated_offer)
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
    	ShoppingOfferHelper.delete_shopping_offer(token, offer_id).then(function(data) {
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
		ShoppingOfferHelper.get_all_shopping_offers(token).then(function(data) {
			HttpHelper.success(res, data.data, data.message);
		}, function(err) {
			HttpHelper.error(res, err.err || null, err.message);
		});	
	}
	

}
