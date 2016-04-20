'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var RecoHelper = require('./reco.hlpr.js');
var moment = require('moment');
var Coupon = mongoose.model('Coupon');
var User = mongoose.model('User');
var OutletCtrl = require('../outlet.ctrl');
var geolib = require('geolib');

module.exports.create_cashback_coupon = function(token, new_coupon) {
    logger.log();
    var deferred = Q.defer();

    var coupon = {};
    
    AuthHelper.get_user(token).then(function(data) {
        coupon = new Coupon(new_coupon);

        coupon.save(function(err, coupon) {
            if (err) {
                console.log(err);
                deferred.reject({
                    err: err || false,
                    message: 'Couldn\'t create coupon'
                });
            } else {
                deferred.resolve({
                    data: coupon,
                    message: 'Coupon created successfully'
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

module.exports.get_cashback_coupon = function(token, couponId) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findById(couponId)
        .exec(function(err, cashback_coupon) {
            if (err || !cashback_coupon) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load Coupon details'
                })
            } else {
               
                deferred.resolve({
                    data: cashback_coupon,
                    message: 'Coupon found'
                });
            }
        })
    return deferred.promise;
}


module.exports.update_cashback_coupon = function(token, updated_coupon) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findById(updated_coupon._id)
        .exec(function(err, cashback_coupon) {
            if (err || !cashback_coupon) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to update coupon'
                });
            } else {
                cashback_coupon = _.extend(cashback_coupon, updated_coupon);
                cashback_coupon.save(function(err) {
                    if (err) {
                        console.log(err)
                        deferred.reject({
                            err: err || true,
                            message: 'Failed to update coupon'
                        });
                    } else {
                        deferred.resolve({
                            data: cashback_coupon,
                            message: "Coupon updated successfully"
                        });
                    }
                });
            }
        });
    return deferred.promise;
}

module.exports.delete_cashback_coupon = function(token, couponId) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findOneAndRemove({
            _id: couponId
        })
        .exec(function(err) {
            if (err) {
                deferred.reject({
                    data: err || true,
                    message: 'Unable to delete the coupon right now'
                });
            } else {
                deferred.resolve({
                    data: {},
                    message: 'Deleted coupon successfully'
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
