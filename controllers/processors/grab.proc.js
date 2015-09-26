var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Cache = require('../../common/cache.hlpr');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var ObjectId = mongoose.Types.ObjectId;

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  if (!_.get(data, 'event_data.event_meta.code') || !_.get(data, 'event_data.event_outlet')) {
    deferred.reject('No coupon code or outlet sent to grab');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    var user_id = data.user._id;
    var coupon_code = data.event_data.event_meta.code;
    Cache.hget(user_id, 'social_pool_coupons', function(err,reply) {
        if(err || !reply) {
            deferred.reject('Unable to find offer to grab');
        } else {
            var social_coupons = JSON.parse(reply);
            var index = _.findIndex(social_coupons, function(coupon) { 
                return coupon.code === coupon_code; 
            });
            if(index === -1) {
                deferred.reject('Unable to find offer to grab');
            } else {
                var coupon = social_coupons[index];
                var coupon_id = coupon._id.toString();
                _.each(coupon.social_friend_list, function(friend) {
                    Cache.hget(friend, 'social_pool_coupons', function(err, reply) {
                        if(err || !reply) {
                            logger.error(err, reply);
                        } else {
                            var coupon_pool = JSON.parse(reply);
                            var new_social_pool = [];
                            _.each(coupon_pool, function(coupon_in_pool) {
                                if(coupon_in_pool._id !== coupon_id) {
                                    new_social_pool.push(coupon);
                                }
                            });
                            Cache.hset(friend, 'social_pool_coupons', JSON.stringify(new_social_pool));
                        }
                    });
                });
                Cache.hget(coupon.lapsed_coupon_source.id, 'social_pool_coupons', function(err, reply) {
                    if(err || !reply) {
                       logger.error(err);
                    } 
                    else {
                        var coupon_pool = JSON.parse(reply);
                        var new_social_pool = [];
                       _.each(coupon_pool, function(coupon_in_pool) {
                           if(coupon_in_pool._id !== coupon_id) {
                                new_social_pool.push(coupon);
                           }
                       });
                        Cache.hset(coupon.lapsed_coupon_source.id, 'social_pool_coupons', JSON.stringify(new_social_pool));                         
                    }    
                }); 
                
                
                coupon._id = new ObjectId();
                coupon.status = 'active';
                coupon.is_grabbed = true;
                User.findOneAndUpdate({
                    '_id': ObjectId(coupon.lapsed_coupon_source.id),
                    'coupons._id': coupon_id
                    },
                    {   $set: {
                            'coupons.$.grabbed_by': user_id, 'coupons.$.status': 'grabbed'
                        }
                    },
                    {
                        upsert: true
                    },  
                    function(err, u) {
                        if(err || !u) {
                            deferred.reject('Unable to grab the offer right now');
                        } 
                        else {
                            User.findOneAndUpdate({
                                _id: user_id
                            }, {
                                $push: {
                                coupons: coupon
                              }

                            }, function(err, u) {
                                if(err || !u) {
                                    deferred.reject('Unable to grab the offer right now');
                                }                                 
                                else    {
                                    //Cache.hget(user_id, 'coupon_map', function(err, reply) {
                                        //if(err) {
                                           //logger.log(err);
                                        //}
                                        //var coupon_map = {};
                                       // if(reply) {
                                        //    coupon_map = JSON.parser(reply);
                                       // }
                                        //if(!coupon_map[coupon.issued_by] || !coupon_map[coupon.issued_by].coupons) {
                                        //    coupon_map[coupon.issued_by] = {coupons: []};
                                       // }
                                        //coupon_map[coupon.issued_by].coupons.push(coupon);
                                        //Cache.hset(user_id, 'coupon_map', JSON.parse(coupon_map));
                                    //});

                                    deferred.resolve('Offer grabbed successfully');
                                }
                            });                                  
                        }
                    }
                );
                
            }
        }
    });

    return deferred.promise;
};
