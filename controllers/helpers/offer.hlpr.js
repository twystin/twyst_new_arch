'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var AuthHelper = require('../../common/auth.hlpr');

module.exports.create_offer = function(token, new_offer) {
    var deferred = Q.defer();
    var offer = _.clone(new_offer);
    var primary_outlet = new_offer.primary_outlet;
    delete offer.outlets;

    AuthHelper.get_user(token).then(function(data) {
        Cache.get('outlets', function(err, reply) {
            if (err || !reply) {
                deferred.reject('Could not find outlets');
            } else {
                Outlet.update({
                        '_id': ObjectId(primary_outlet)
                    }, {
                        $push: {
                            "offers": offer
                        }
                    })
                    .exec(function(err, count) {
                        if (err || !count) {
                            deferred.reject({
                                err: err || true,
                                message: 'Couldn\'t add the offer'
                            });
                        } else {
                            var outlets = JSON.parse(reply);
                            if(_.has(outlets, primary_outlet + '.offers'))
                                outlets[primary_outlet].offers.push(offer);
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