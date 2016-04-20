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
var ShoppingOffer = mongoose.model('ShoppingOffer');
var User = mongoose.model('User');

module.exports.create_shopping_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();

    var offer = {};
    offer = _.extend(offer, new_offer);
    offer.currently_available_voucher_count = offer.offer_voucher_count;
    offer._id = new ObjectId();

    AuthHelper.get_user(token).then(function(data) {
        offer = new ShoppingOffer(offer);

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

module.exports.get_shopping_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    ShoppingOffer.findById(offerId)
        .exec(function(err, shopping_offer) {
            if (err || !shopping_offer) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load offer details'
                })
            } else {
               
                deferred.resolve({
                    data: shopping_offer,
                    message: 'Offer found'
                });
            }
        })
    return deferred.promise;
}


module.exports.update_shopping_offer = function(token, updated_offer) {
    logger.log();
    var deferred = Q.defer();

    ShoppingOffer.findById(updated_offer._id)
        .exec(function(err, shopping_offer) {
            if (err || !shopping_offer) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to update offer'
                });
            } else {
                shopping_offer = _.extend(shopping_offer, updated_offer);
                shopping_offer.save(function(err) {
                    if (err) {
                        console.log(err)
                        deferred.reject({
                            err: err || true,
                            message: 'Failed to update offer'
                        });
                    } else {
                        deferred.resolve({
                            data: shopping_offer,
                            message: "Offer updated successfully"
                        });
                    }
                });
            }
        });
    return deferred.promise;
}

module.exports.delete_shopping_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    ShoppingOffer.findOneAndRemove({
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


module.exports.get_all_shopping_offers = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        
        ShoppingOffer.find({}).exec(function(err, shopping_offers) {
            if (err || !shopping_offers) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to load offers'
                });
            } 
            else{
                _.each(shopping_offers, function(offer){
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
                    data: shopping_offers,
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
