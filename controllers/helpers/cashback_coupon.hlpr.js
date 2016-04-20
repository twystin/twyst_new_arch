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
var Coupon = mongoose.model('Coupon');
var User = mongoose.model('User');

module.exports.create_cashback_coupon = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();

    var offer = {};
    offer = _.extend(offer, new_offer);
    offer.currently_available_voucher_count = offer.offer_voucher_count;
    offer._id = new ObjectId();

    AuthHelper.get_user(token).then(function(data) {
        offer = new Coupon(offer);

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

module.exports.get_cashback_coupon = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findById(offerId)
        .exec(function(err, cashback_coupon) {
            if (err || !cashback_coupon) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load offer details'
                })
            } else {
               
                deferred.resolve({
                    data: cashback_coupon,
                    message: 'Offer found'
                });
            }
        })
    return deferred.promise;
}


module.exports.update_cashback_coupon = function(token, updated_offer) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findById(updated_offer._id)
        .exec(function(err, cashback_coupon) {
            if (err || !cashback_coupon) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to update offer'
                });
            } else {
                cashback_coupon = _.extend(cashback_coupon, updated_offer);
                cashback_coupon.save(function(err) {
                    if (err) {
                        console.log(err)
                        deferred.reject({
                            err: err || true,
                            message: 'Failed to update offer'
                        });
                    } else {
                        deferred.resolve({
                            data: cashback_coupon,
                            message: "Offer updated successfully"
                        });
                    }
                });
            }
        });
    return deferred.promise;
}

module.exports.delete_cashback_coupon = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findOneAndRemove({
            _id: offerId
        })
        .exec(function(err) {
            if (err) {
                deferred.reject({
                    data: err || true,
                    message: 'Unable to delete the shopping offers right now'
                });
            } else {
                deferred.resolve({
                    data: {},
                    message: 'Deleted shopping offers successfully'
                });
            }
        });
    return deferred.promise;
}


module.exports.get_all_cashback_coupons = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        
        Coupon.find({}).exec(function(err, cashback_coupons) {
            if (err || !cashback_coupons) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to load offers'
                });
            } 
            else{
                _.each(cashback_coupons, function(offer){
                    if(offer.source === 'Amazon') {
                        offer.logo = 'https://s3-us-west-2.amazonaws.com/retwyst-shopping-partner/Amazon/amazon.png';       
                    }
                    else if(offer.source === 'Flipkart') {
                        offer.logo = 'https://s3-us-west-2.amazonaws.com/retwyst-shopping-partner/Flipkart/flipkart.png';       
                    }
                    else if(offer.source === 'Ebay') {
                        offer.logo = 'https://s3-us-west-2.amazonaws.com/retwyst-shopping-partner/Ebay/ebay.png';       
                    }                    
                }) 
                
                deferred.resolve({
                    data: cashback_coupons,
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
