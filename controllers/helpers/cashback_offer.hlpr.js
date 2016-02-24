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
                cashback_offer = _.merge(cashback_offer, updated_offer);
                cashback_offer.save(function(err) {
                    if (err) {
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
                    message: 'Failed to update offer'
                });
            } else {

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

module.exports.use_cashback_offer = function(token, offer_id) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        var available_twyst_bucks =  _.get(data, 'data.twyst_bucks');
        CashbackOffer.findOne({'offers._id': offer_id }, function(err, cashback_partner){
            if(err || !cashback_partner) {
                console.log( 'error '+ err);
                deferred.reject({
                    err: err || false,
                    message: 'This offer is no more available'
                });
            }
            else if(cashback_partner && cashback_partner.offers && cashback_partner.offers.length){
                var matching_offer = getMatchingOffer(cashback_partner.offers, offer_id);
                if(matching_offer){
                    var is_enough_bucks = check_enough_twyst_buck(matching_offer, available_twyst_bucks);

                    if(is_enough_bucks){
                        if(matching_offer.currently_available_voucher_count){
                            assign_voucher(cashback_partner._id, matching_offer, user).then(function(data) {
                                send_email();

                                deferred.resolve(data); 
                            })   
                        }
                        else{
                            deferred.reject({
                                err: err || false,
                                message: 'Offer is not available right now'
                            });                            
                        }
                    }
                    else{
                        deferred.reject({
                            err: err || false,
                            message: 'Not enough twyst bucks'
                        });
                        
                    }
                      
                }
                else {
                    deferred.reject({
                        err: err || false,
                        message: 'This offer is no more available'
                    });
                }
                 
            }
            else {
                deferred.reject({
                    err: err || false,
                    message: 'This offer is no more available'
                });
            }
        })     
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });
return deferred.promise;
    
}


function getMatchingOffer(offers, offer_id){
    for (var i = 0; i < offers.length; i++) {
        if(offers[i]._id.toString() === offer_id.toString()) {
            return   offers [i];       
        }
    }
    return null;
}

function check_enough_twyst_buck (offer, bucks) {
    if(offer.offer_cost <= bucks) {
        return true;
    }
    else{
        return false;
    }
}


function assign_voucher(partner_id, offer, user) {
    logger.log();
    var deferred = Q.defer();
    var voucher = {};
    voucher.type = 'cashback voucher';
    var available_voucher_count = offer.currently_available_voucher_count - 1;
    voucher.offer_id = offer._id;
    var update = {
        $set:{
            'currently_available_voucher_count.$': available_voucher_count
        }
    }
    
    CashbackOffer.findOneAndUpdate({
        _id: partner_id,
        'offers._id': offer._id
        },
        update,
        function(err, offers) {
        if(err || !offers) {
            console.log('offer save err', err);
        }
        else{
            console.log('here')
            User.findOne({_id: user._id}).exec(function(err, user) {
                if (err || !user) {
                  console.log('user save err', err);
                  deferred.reject('Could not update user');
                } 
                else {
                    user.coupons.push(voucher);
                    user.save(function(err, user) {
                        if (err || !user) {
                          console.log('user save err', err);
                        } 
                        else {
                            console.log('user saved');
                            deferred.resolve(user);
                        }
                    });
                }
            });      
        }
    })

    return deferred.promise;
}

function send_email(user, data) {

}