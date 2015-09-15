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

module.exports.create_offer = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();
    var offer = {};
    offer = _.extend(offer, new_offer);
    offer.offer_group = new ObjectId();
    var outletIds = _.map(offer.offer_outlets, function(obj) { return ObjectId(obj); });

    AuthHelper.get_user(token).then(function(data) {
        Cache.get('outlets', function(err, reply) {
            if (err || !reply) {
                deferred.reject('Could not find outlets');
            } else {
                Outlet.update({
                        '_id': {
                            $in: outletIds
                        }
                    }, {
                        $push: {
                            "offers": offer
                        }
                    }, {
                        multi: true
                    })
                    .exec(function(err, count) {
                        if (err || !count) {
                            deferred.reject({
                                err: err || true,
                                message: 'Couldn\'t add the offer'
                            });
                        } else {
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
                                data: count,
                                message: 'Successfully added the offer'
                            });
                        }
                    });
            }
        });
    });

    return deferred.promise;
}

module.exports.get_offer = function(token, offerGroup) {
    logger.log();
    var deferred = Q.defer();
    Outlet.findOne({
        'offers.offer_group': offerGroup
    })
    .exec(function(err, outlet) {
        if(err || !outlet) {
            deferred.reject({
                err: err,
                message: 'Unable to load offer details'
            })
        } else {
            var offer = _.filter(outlet.offers, function(offer) {
                return offer.offer_group.toString() === offerGroup;
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
    var outletIds = _.map(new_offer.offer_outlets, function(obj) { return ObjectId(obj); });
    Outlet.find({
        $or: [{
            '_id': {$in: outletIds}
        }, {
            'offers.offer_group': new_offer.offer_group
        }]
    }).exec(function(err, outlets) {
        if(err || !outlets) {
            deferred.reject({err: err || true, message: 'Failed to update offer'});
        } else {
            async.each(outlets, function(outlet, callback) {
                if(new_offer.offer_outlets.indexOf(outlet._id.toString())===-1) {
                    var index = _.findIndex(outlet.offers, function(offer) { return offer.offer_group.toString() == new_offer.offer_group; });
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
                    var offer = _.findWhere(outlet.offers, {offer_group: ObjectId(new_offer.offer_group)});
                    if(!offer) {
                        outlet.offers.push(new_offer);
                    } else {
                        offer = _.merge(offer, new_offer); 
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
                    deferred.resolve({data: new_offer, message: "Offer updated successfully"});
                }
            });
        }
    });
    return deferred.promise;
}

module.exports.delete_offer = function(token, offer_group) {
    logger.log();
    var deferred = Q.defer();
    Outlet.find({
        'offers.offer_group': ObjectId(offer_group)
    }).exec(function(err, outlets) {
        if(err || !outlets) {
            deferred.reject({err: err || true, message: 'Failed to update offer'});
        } else {
            async.each(outlets, function(outlet, callback) {
                var index = _.findIndex(outlet.offers, function(offer) { return offer.offer_group.toString()==offer_group; });
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
                    deferred.resolve({data: {}, message: 'Offer deleted successfully'});
                }
            });
        }
    });
    return deferred.promise;
}