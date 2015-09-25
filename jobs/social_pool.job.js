'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var notification = require('../notifications/social_pool.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
require('../models/event.mdl')
var User = mongoose.model('User');
var Event = mongoose.model('Event')
var Cache = require('../common/cache.hlpr');
var AuthHelper = require('../common/auth.hlpr.js');

exports.runner = function(agenda) {
    agenda.define('social_pool', function(job, done) {
        logger.log();
        console.log('inside pool');
        User.find({
            "role": 6,
            "coupons.coupon_source": "QR",
            "coupons.status": "active",
            "coupons.lapse_date": {
                $lte: new Date()
            }
        }).populate('friends').exec(function(err, users) {
            logger.log();
            if (err || users.length === 0) {
                done(err || false);
            } else {
                _.each(users, function(item) {
                    item = item.toJSON();
                    process_user(item);
                });
                done();
            }
        });
    });
}

function process_user(user) {
    var current_time = new Date();
    current_time = current_time.getTime();
    _.each(user.coupons, function(coupon) {
        if (coupon.status === 'active' && coupon.coupon_source === "QR"  && coupon.lapse_date.getTime() <= current_time && coupon.expiry_date.getTime() > current_time){
            coupon.status = 'social_pool';
            coupon.offer_type = 'pool';
            coupon.lapse_date = coupon.expiry_date;
            coupon.lapsed_coupon_source = {};
            coupon.lapsed_coupon_source.id = user._id;
            coupon.lapsed_coupon_source.name = user.first_name || '';
            coupon.lapsed_coupon_source.phone = user.phone || '';
            coupon.social_friend_list = [];
            
            _.each(user.friends.friends, function(friend) {
                if (friend.user) {
                    var arr = [];
                    arr.push(coupon);
                    coupon.social_friend_list.push(friend.user);
                    Cache.hget(friend.user, 'social_pool_coupons', function(err, reply) {
                        if (err || !reply) {
                            console.log('first push')
                            Cache.hset(friend.user, 'social_pool_coupons', JSON.stringify(arr));
                        } else {
                            var a = JSON.parse(reply);
                            a.push(arr[0]);
                            console.log('updated friends coupons', a.length);
                            Cache.hset(friend.user, 'social_pool_coupons', JSON.stringify(a));
                        }
                    })

                    Cache.hget(user._id, 'social_pool_coupons', function(err, reply) {
                        if(err || !reply) {
                            console.log('first push')
                            Cache.hset(user._id, 'social_pool_coupons', JSON.stringify(arr));
                        } else {
                            var a = JSON.parse(reply);
                            a.push(arr[0]);
                            console.log('updated user coupons', a.length);
                            Cache.hset(user._id, 'social_pool_coupons', JSON.stringify(a));
                        }
                    });
                    
                }
            });
            
            User.findOneAndUpdate({
                _id: user._id,
                'coupons._id': coupon._id
            }, {
                $set: {
                    'coupons.$.status': 'social_pool',
                }
            }).exec(function(err) {
                if (err) {
                    logger.error(err);
                }
                RecoHelper.cache_user_coupons(user);

            });
        }
    });

}