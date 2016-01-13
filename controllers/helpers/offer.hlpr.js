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
var Cache = require('../../common/cache.hlpr.js');
var RecoHelper = require('./reco.hlpr');
var moment = require('moment');

module.exports.create_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();
    var offer = {};
    offer = _.extend(offer, new_offer);
    offer._id = new ObjectId();
    var outletIds = _.map(offer.offer_outlets, function(obj) { return ObjectId(obj); });

    AuthHelper.get_user(token).then(function(data) {
        Cache.get('outlets', function(err, reply) {
            if (err || !reply) {
                deferred.reject('Could not find outlets');
            } else {
                Outlet.find({
                    _id: {
                        $in: outletIds
                    }
                }).exec(function(err, outlets) {
                    if(err || !outlets) {
                        deferred.reject({
                            err: err || true,
                            message: "Couldn't add the offer"
                        })
                    } else {
                        _.each(outlets, function(outlet) {
                            outlet.offers.push(offer);
                            outlet.save(function(err) {
                                if(err) {
                                    logger.error(err);
                                }
                            });
                        });
                        var outlets = JSON.parse(reply);
                        _.each(outletIds, function(outletId) {
                            if(outlets[outletId.toString()]) {
                                if (!outlets[outletId.toString()].offers) {
                                    outlets[outletId.toString()].offers = [];
                                }
                                outlets[outletId.toString()].offers.push(offer);
                            }
                        });
                        Cache.set('outlets', JSON.stringify(outlets), function(err) {
                            if(err) {
                                logger.error("Error setting outlets ", err);
                            }
                        });
                        deferred.resolve({
                            data: offer,
                            message: 'Successfully added the offer'
                        });
                    }
                });
            }
        });
    });

    return deferred.promise;
}

module.exports.get_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();
    Outlet.findOne({
        'offers._id': offerId
    })
    .exec(function(err, outlet) {
        if(err || !outlet) {
            deferred.reject({
                err: err,
                message: 'Unable to load offer details'
            })
        } else {
            var offer = _.filter(outlet.offers, function(offer) {
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

module.exports.update_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();
    new_offer._id = ObjectId(new_offer._id);
    var outletIds = _.map(new_offer.offer_outlets, function(obj) { return ObjectId(obj); });
    Outlet.find({
        $or: [{
            '_id': {$in: outletIds}
        }, {
            'offers._id': new_offer._id
        }]
    }).exec(function(err, outlets) {
        if(err || !outlets) {
            deferred.reject({err: err || true, message: 'Failed to update offer'});
        } else {
            async.each(outlets, function(outlet, callback) {
                if(new_offer.offer_outlets.indexOf(outlet._id.toString())===-1) {
                    var index = _.findIndex(outlet.offers, function(offer) { return offer._id.toString() == new_offer._id.toString(); });
                    if(index!==-1) {
                        outlet.offers.splice(index, 1);
                        outlet.save(function(err) {
                            if(err) {
                                callback(err)
                            } else {
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }
                } else {
                    var offer = _.findWhere(outlet.offers, {_id: new_offer._id});
                    if(!offer) {
                        outlet.offers.push(new_offer);
                    } else {
                        offer = _.merge(offer, new_offer); 
                        offer.offer_outlets = new_offer.offer_outlets;
                    }
                    outlet.save(function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    })
                }
            }, function(err) {
                if(err) {
                    deferred.reject({err: err || true, message: 'Failed to update offer'});
                } else {
                    _updateCache(outlets);
                    deferred.resolve({data: new_offer, message: "Offer updated successfully"});
                }
            });
        }
    });
    return deferred.promise;
}

var _updateCache = function(updated_outlet) {
    Cache.get('outlets', function(err, reply) {
        if(err) {
            logger.error("Error retrieving outlets for updating");
        } else {
            var outlets = [];
            if(reply) {
                outlets = JSON.parse(reply);
            }
            async.each(updated_outlet, function(outlet, callback) {
                outlets[outlet._id.toString()] = outlet;
                callback();
            }, function(err) {
                Cache.set('outlets', JSON.stringify(outlets), function(err) {
                    if(err) { logger.error("Error updating outlets"); }
                });
            });
        }
    });
}

module.exports.delete_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();
    Outlet.find({
        'offers._id': ObjectId(offerId)
    }).exec(function(err, outlets) {
        if(err || !outlets) {
            deferred.reject({err: err || true, message: 'Failed to update offer'});
        } else {
            async.each(outlets, function(outlet, callback) {
                var index = _.findIndex(outlet.offers, function(offer) { return offer._id.toString()===offerId; });
                if(index!==-1) {
                    outlet.offers.splice(index, 1);
                    outlet.save(function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            }, function(err) {
                if(err) {
                    deferred.reject({err: err || true, message: 'An error occured while deleting offer'});
                } else {
                    _updateCache(outlets);
                    deferred.resolve({data: {}, message: 'Offer deleted successfully'});
                }
            });
        }
    });
    return deferred.promise;
}

module.exports.get_all_offers = function(token) {
    logger.log();
    var deferred = Q.defer();
    Cache.get('outlets', function(err, reply) {
        if(err || !reply) {
            deferred.reject({
                err: false,
                message: 'Unable to load offers right now'
            });
        } else {
            var offer_ids = [];
            var offers = [];
            var outlets = JSON.parse(reply);
            _.each(outlets, function(outlet) {
                _.each(outlet.offers, function(offer) {
                    if(offer_ids.indexOf(offer._id.toString())===-1) {
                        offer_ids.push(offer._id.toString());
                        offer.outlet = {
                            _id: outlet._id,
                            name: outlet.basics.name,
                            loc1: outlet.contact.location.locality_1[0],
                            loc2: outlet.contact.location.locality_2[0]
                        };
                        offers.push(offer);
                    }
                });
            });
            deferred.resolve({
                data: offers,
                message: 'All offers loaded from server'
            });
        }
    });
    return deferred.promise;
}

module.exports.apply_offer = function(token, order, offer) {
    logger.log();
    var deferred = Q.defer();

    Cache.get('outlets', function(err, reply) {
        if(err || !reply) {
            deferred.reject({
                err: false,
                message: 'Unable to load offers right now'
            });
        } else {
            var offer_ids = [];
            var offers = [];
            var outlets = JSON.parse(reply);
            
            deferred.resolve({
                data: offers,
                message: 'All offers loaded from server'
            });
        }
    });
    return deferred.promise;
}

module.exports.get_offers = function(token, outlet_id) {
    logger.log();
    var deferred = Q.defer();
    Outlet.findOne({
        '_id': outlet_id
    })
    .exec(function(err, outlet) {
        if(err || !outlet) {
            deferred.reject({
                err: err,
                message: 'Unable to load offer details'
            })
        } else {
            var date = new Date();
            var time = moment().hours() +':'+moment().minutes();
            date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();
            var offers = _.map(outlet.offers, function(offer) {
                if(offer.offer_status === 'active' && new Date(offer.offer_end_date) > new Date()
                && !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours))) {
                    return offer;
                }
                else{
                    return false;
                }
            });
            if(offers.length) {
                deferred.resolve({data: offers, message: 'Offers found'});
            } else {
                deferred.reject({ err: null, message: 'Unable to load offers'});
            }
        }
    })
    return deferred.promise;
}