'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/social_pool.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
require('../models/event.mdl')
var User = mongoose.model('User');
var Event = mongoose.model('Event')

exports.runner = function(agenda) {
    agenda.define('social_pool', function(job, done) {
        logger.log();

        User.find({
            "coupons.status": "active",
            "coupons.used_details": {
                $exists: false
            }
            "coupons.lapse_date": {
                "$lte": new Date()
            },
        }).populate('friends').exec(function(err, users) {
            logger.log();
            if (err || users.length === 0) {
                done(err || false);
            } else {
                _.each(users, function(item) {
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
        if (coupon.lapse_date.getTime() <= current_time && coupon.status === 'active' && !coupon.used_details && user.friends) {
            coupon.status = 'social_pool';
            coupon.lapsed_coupon_source = user._id;
            coupon.social_friend_list = [];
            _.each(user.friends, function(friend) {
                if (friend.user) {
                    coupon.social_list.push(friend.user);
                }
            })
            User.findOneAndUpdate({
                _id: ObjectId('')
            }, {
                $push: {
                    coupons: coupon
                }
            }, function(err, user) {
                if (err || !user) {
                    logger.log(err)
                } else
                    logger.log('coupon saved successfully')
            });
            User.findOneAndUpdate({
                _id: ObjectId(user._id),
                'coupons._id': coupon._id
            }, {
                $set: {
                    'coupons.$.status': 'social_pool',
                }
            }).exec(function(err, user) {
                if(err) {
                    logger.error(err);
                }
            });
        }
    });
    notification.notify(what, null, user, null).then(function(data) { //what?
        logger.log(data);
    }, function(err) {
        logger.log(err);
    });
    
}