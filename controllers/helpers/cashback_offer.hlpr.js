'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var moment = require('moment');
var CashbackOffer = mongoose.model('CashbackOffer');
var User = mongoose.model('User');

module.exports.create_cashback_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();

    var offer = {};
    offer = _.extend(offer, new_offer);
    offer.currently_available_voucher_count = offer.offer_voucher_count;
    offer._id = new ObjectId();

    AuthHelper.get_user(token).then(function(data) {
        offer = new CashbackOffer(offer);

        offer.save(function(err, offer) {
            if (err) {
                console.log(err);
                deferred.reject({
                    err: err || false,
                    message: 'Couldn\'t create offer'
                });
            } else {
                deferred.resolve({
                    data: offer,
                    message: 'Offer created successfully'
                });
            }
        });
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });

    return deferred.promise;
}

module.exports.get_cashback_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    CashbackOffer.findById(offerId)
        .exec(function(err, cashback_offers) {
            if (err || !cashback_offers) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load offer details'
                })
            } else {
               
                deferred.resolve({
                    data: cashback_offers,
                    message: 'Offer found'
                });
            }
        })
    return deferred.promise;
}


module.exports.update_cashback_offer = function(token, updated_offer) {
    logger.log();
    var deferred = Q.defer();

    CashbackOffer.findById(updated_offer._id)
        .exec(function(err, cashback_offer) {
            if (err || !cashback_offer) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to update offer'
                });
            } else {
                console.log(updated_offer)
                cashback_offer = _.extend(cashback_offer, updated_offer);
                cashback_offer.save(function(err) {
                    if (err) {
                        console.log(err)
                        deferred.reject({
                            err: err || true,
                            message: 'Failed to update offer'
                        });
                    } else {
                        deferred.resolve({
                            data: cashback_offer,
                            message: "Offer updated successfully"
                        });
                    }
                });
            }
        });
    return deferred.promise;
}

module.exports.delete_cashback_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    CashbackOffer.findOneAndRemove({
            _id: offerId
        })
        .exec(function(err) {
            if (err) {
                deferred.reject({
                    data: err || true,
                    message: 'Unable to delete the cashback offers right now'
                });
            } else {
                deferred.resolve({
                    data: {},
                    message: 'Deleted cashback offers successfully'
                });
            }
        });
    return deferred.promise;
}


module.exports.get_all_cashback_offers = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        
        CashbackOffer.find({}).exec(function(err, cashback_offers) {
            if (err || !cashback_offers) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to load offers'
                });
            } 
            else{
                _.each(cashback_offers, function(offer){
                    offer.logo = 'https://s3-us-west-2.amazonaws.com/retwyst-shopping-partner/56de9bdf0c02d66e1f2b72a0/logo';    
                }) 
                deferred.resolve({
                    data: cashback_offers,
                    message: 'Offer loaded successfully'
                });   
            }
        });
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });
    return deferred.promise;
}
