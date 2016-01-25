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

module.exports.create_cashback_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();

    var offer = {};
    offer = _.extend(offer, new_offer);
    offer._id = new ObjectId();

    AuthHelper.get_user(token).then(function(data) {
        offer = new CashbackOffer(offer);

        offer.save(function(err, offer) {
            if(err) {
                console.log(err);
                deferred.reject({
                    err: err || false,
                    message: 'Couldn\'t create offer'
                });
            }
            else{
                deferred.resolve({data: offer, message: 'Offer created successfully'});
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

module.exports.get_cashbcak_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    CashbackOffer.findOne({
        'offers._id': offerId
    })
    .exec(function(err, cashback_offers) {
        if(err || !cashback_offers) {
            deferred.reject({
                err: err,
                message: 'Unable to load offer details'
            })
        } else {
            var offer = _.filter(cashback_offers.offers, function(offer) {
                return offer._id.toString() === offerId;
            });
            if(offer.length) {
                deferred.resolve({data: offer[0], message: 'Offer found'});
            } else {
                deferred.reject({ err: null, message: 'Unable to load offer details'});
            }
        }
    })
    return deferred.promise;
}

module.exports.update_cashback_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();

    new_offer._id = ObjectId(new_offer._id);
    
    CashbackOffer.findOne({'offers._id': new_offer._id})
    .exec(function(err, cashback_offers) {
        if(err || !offers) {
            deferred.reject({err: err || true, message: 'Failed to update offer'});
        } else {
            var offer = _.findWhere(outlet.offers, {_id: new_offer._id});
            if(offer._id === new_offer._id) {
                offer = _.merge(offer, new_offer);
                cashback_offers.save(function(err) {
                    if(err) {
                       deferred.reject({err: err || true, message: 'Failed to update offer'}); 
                    } else {
                        deferred.resolve({data: new_offer, message: "Offer updated successfully"});
                    }
                })
            }    
            else{
                deferred.resolve({data: new_offer, message: "Offer updated successfully"});
            }
        }
    });
    return deferred.promise;
}


module.exports.delete_cashback_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();

    CashbackOffer.findOne({
        'offers._id': ObjectId(offerId)
    }).exec(function(err, cashback_offers) {
        if(err || !cashback_offers) {
            deferred.reject({err: err || true, message: 'Failed to update offer'});
        } else {
            var index = _.findIndex(cashback_offers.offers, function(offer) { return offer._id.toString() === offerId; });
                
            if(index !== -1) {
                cashback_offers.offers.splice(index, 1);
                cashback_offers.save(function(err) {
                    if(err) {
                        console.log(err);
                        deferred.reject({err: err || true, message: 'An error occured while deleting offer'});
                    } else {
                        deferred.resolve({data: {}, message: 'Offer deleted successfully'});
                    }
                });
            } 
        }
    });
    return deferred.promise;
}

module.exports.get_all_cashback_offers = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        if (user.role > 2) {
            deferred.reject({
                err: false,
                message: 'Access denied'
            });
        } else {
            CashbackOffer.find({}).exec(function(err, cashback_offers) {
                if(err || !cashback_offers) {
                    deferred.reject({err: err || true, message: 'Failed to update offer'});
                } else {
                    
                    deferred.resolve({data: cashback_offers, message: 'Offer loaded successfully'});
                   
                }
            });
               
        }
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });
    return deferred.promise;
}