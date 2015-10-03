var logger = require('tracer').colorConsole();

var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
var dateFormat = require('dateformat')
require('../../models/qr_code.mdl');
require('../../models/event.mdl');
require('../../models/user.mdl');
var QR = mongoose.model('QR');
var Event = mongoose.model('Event');
var User = mongoose.model('User');
var RecoHelper = require('../helpers/reco.hlpr');
var Cache = require('../../common/cache.hlpr');
var AccountHelper = require('../helpers/account.hlpr');
var http = require('http');
var Transporter = require('../../transports/transporter.js');

module.exports.check = function(data) {
    logger.log();
    var deferred = Q.defer();
    validate_request(data)
        .then(function(data) {
            return already_checked_in(data);
        })
        .then(function(data) {
            deferred.resolve(data);
        })
        .fail(function(err) {
            data.event_data.event_type = 'checkin';
            deferred.reject(err);
        })
    return deferred.promise;
}

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    check_and_create_coupon(data)
        .then(function(data) {
            return update_checkin_counts(data);
        })
        .then(function(data) {
            return send_sms(data);
        })
        .then(function(data) {
            data.event_data.event_type = 'checkin'
            deferred.resolve(data);
        })
        .fail(function(err) {
            data.event_data.event_type = 'checkin';
            deferred.reject(err);
        })
    return deferred.promise;
}


function validate_request(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var phone = _.get(passed_data, 'event_data.event_meta.phone'),
        date = _.get(passed_data, 'event_data.event_meta.date'),
        today = new Date();
    if (!date) {
        date = new Date();
    } else {
        date = new Date(date);
    }

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        deferred.reject('Phone number missing or invalid');
    }

    if (!date || date.getTime() > today.getTime()) {
        deferred.reject('Checkin-in cannot be set in the future');
    }

    if (!data.outlet) {
        deferred.reject('Provide the outlet info to checkin the user');
    }
    if (_.get(data, 'outlet.outlet_meta.status') !== 'active') {
        deferred.reject('Trying to checkin at an outlet that is not active right now')
    }

    User.findOne({
        phone: phone
    }).exec(function(err, user) {
        if (err) {
            logger.error(err);
            deferred.reject('The customer in not on Twyst');
        } 
        else if(!user){ // create new user and checkin 
            AccountHelper.create_user_account(phone).then(function(data) {                
                passed_data.user = data.data.user;
                deferred.resolve(passed_data);
            
            }, function(err) {
                console.log(err)
                deferred.reject('could not create user')
            })
        }
        else{
            passed_data.user = user;
            deferred.resolve(passed_data);
        }
    });

    return deferred.promise;
}

function already_checked_in(data) {
    logger.log();
    var deferred = Q.defer();
    var THREE_HOURS = new Date(Date.now() - 10800000);
    var FIVE_MINS = new Date(Date.now() - 300000);

    var deferred = Q.defer();

    var user_id = _.get(data, 'user._id');
    var outlet_id = _.get(data, 'outlet._id');

    Event.find({
        'event_user': user_id,
        'event_type': 'checkin',
        'event_date': {
            $gt: THREE_HOURS
        }
    }, function(err, events) {
        if (err) {
            deferred.reject(err);
        }
        if (events.length) {
            var same_outlet = _.filter(events, {
                event_outlet: outlet_id
            });
            if (same_outlet.length !== 0) {
                deferred.reject('Already checked in here');
            }

            var too_soon = _.find(events, function(event) {
                return event.event_date > FIVE_MINS;
            });

            if (too_soon) {
                deferred.reject('Checked in at another outlet less than 5 minutes ago!');
            } else {
                deferred.resolve(data);
            }
        } else {
            deferred.resolve(data);
        }
    });

    return deferred.promise;
}


function check_and_create_coupon(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var today = new Date();
    var user_id = _.get(data, 'user._id');
    var outlet_id = _.get(data, 'outlet._id');

    var offers = _.get(data, 'outlet.offers');
    var sorted_checkin_offers = _.filter(offers, function(offer) {
        return offer.offer_status === 'active' && new Date(offer.offer_start_date) <= today && new Date(offer.offer_end_date) >= today;
    });
    sorted_checkin_offers = _.sortBy(_.filter(sorted_checkin_offers, {
        'offer_type': 'checkin'
    }), 'rule.event_count');
    Event.find({
        'event_user': user_id,
        'event_type': 'checkin',
        'event_outlet': outlet_id,

    }, function(err, events) {
        if (err) {
            deferred.reject(err);
        }
        var matching_offer = find_matching_offer(events, sorted_checkin_offers);
        if (matching_offer && isNaN(matching_offer)) {
            create_coupon(matching_offer, user_id, outlet_id).then(function(data) {
                if (data.coupons && data.coupons.length) {
                    passed_data.user.coupons.push(data.coupons[data.coupons.length - 1]);
                }
                passed_data.message = 'Check-in successful at '+ passed_data.outlet.basics.name +' on '+ formatDate(new Date(passed_data.event_data.event_meta.date)) +". Reward unlocked! Your voucher will be available on your Twyst app soon. Don't have the app? Get it now at http://twy.st/app";                
                deferred.resolve(passed_data);
            }, function(err) {
                deferred.reject('Could not create coupon' + err);
            })
        } else if (!isNaN(matching_offer)) {
            console.log('locked_offer');
            passed_data.message = 'Check-in successful at '+ passed_data.outlet.basics.name +' on '+ formatDate(new Date(passed_data.event_data.event_meta.date)) +'. You are '+ matching_offer +' check-in(s) away from your next reward. Find '+ passed_data.outlet.basics.name + ' on Twystat http://twy.st/app';
            data.checkins_to_go = matching_offer;
            deferred.resolve(data);
        } else {
            deferred.reject('no matching offer for user');
        }
    });
    return deferred.promise;
}

function find_matching_offer(events, offers) {
    var i, next = [],
        checkins;
    var count, match, event_start, event_end, start_date, event_date;
    _.each(offers, function(offer) {
        var start_date = new Date(offer.offer_start_date);
        var end_date = new Date(offer.offer_end_date);
        checkins = 1; // TO COUNT THIS CHECKIN AS WELL
        _.each(events, function(event) {
            if (event.event_date.getTime() >= start_date.getTime() && event.event_date.getTime() <= end_date.getTime()) {
                checkins += 1;
            }
        });
        offer.checkin_count = checkins;
    });

    offers = _.sortBy(offers, 'checkin_count');

    for (i = 0; i < offers.length; i++) {

        count = _.get(offers[i], 'rule.event_count');
        match = _.get(offers[i], 'rule.event_match');
        event_start = _.get(offers[i], 'rule.event_start');
        event_end = _.get(offers[i], 'rule.event_end');

        if (match === 'on every') {
            console.log('on every', offers[i].checkin_count, count, event_start, event_end);
            if (offers[i].checkin_count % count === 0 && offers[i].checkin_count >= event_start && offers[i].checkin_count <= event_end) {
                return offers[i];
            }
        }

        if (match === 'on only') {
            console.log('on only', offers[i].checkin_count, count);
            if (offers[i].checkin_count === count) {
                return offers[i];
            }
        }

        if (match === 'after') {
            console.log('after', offers[i].checkin_count, event_start, event_end);
            if (offers[i].checkin_count >= event_start && offers[i].checkin_count <= event_end) {
                return offers[i];
            }
        }

        if (match === 'on every' && offers[i].checkin_count >= event_start && offers[i].checkin_count <= event_end) {
            console.log('on every next', offers[i].checkin_count, event_start, event_end);
            var checkins_to_go = count - (offers[i].checkin_count % count);
            next.push(checkins_to_go);
        }

        if (match === 'on only') {
            console.log('on only next', offers[i].checkin_count, count);
            if (count > offers[i].checkin_count) {
                var checkins_to_go = count - offers[i].checkin_count;
                next.push(checkins_to_go);
            }
        }

        if (match === 'after' && event_start >= offers[i].checkin_count) {
            console.log('after next', offers[i].checkin_count, event_start);
            var checkins_to_go = event_start - offers[i].checkin_count;
            next.push(checkins_to_go);
        }
    }
    console.log('next', next);
    if (next.length) {
        return _.sortBy(next, function(num) {
            return num;
        })[0];
    } else {
        return undefined;
    }
}

function create_coupon(offer, user, outlet) {
    logger.log();
    var keygen = require('keygenerator');
    var code = keygen._({
        forceUppercase: true,
        length: 6,
        exclude: ['O', '0', 'L', '1']
    });

    var lapse_date = new Date();
    lapse_date.setDate(lapse_date.getDate() + offer.offer_lapse_days);
    var expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + offer.offer_valid_days);

    var deferred = Q.defer();

    var coupon = {
        _id: mongoose.Types.ObjectId(),
        code: code,
        issued_for: offer._id,
        coupon_source: 'PANEL',
        header: offer.actions.reward.header,
        line1: offer.actions.reward.line1,
        line2: offer.actions.reward.line2,
        terms: offer.terms,
        description: offer.actions.reward.description,
        lapse_date: lapse_date,
        expiry_date: expiry_date,
        meta: {
            reward_type: {
                type: offer.actions.reward.reward_meta.reward_type
            }
        },
        status: 'active',
        issued_at: new Date(),
        issued_by: outlet,
        outlets: offer.offer_outlets
    }
    
    User.findOne({
        _id: user
    }).exec(function(err, user) {
        if (err || !user) {
            console.log('user save err', err);
            deferred.reject('Could not update user');
        } else {
            user.coupons.push(coupon);
            user.save(function(err) {
                if (err) {
                    console.log('user save err', err);
                } else {
                    deferred.resolve(user);
                }
            });
        }
    });

    return deferred.promise;
}

function update_checkin_counts(data) {
    // UPDATE CACHES?
    var deferred = Q.defer();
    RecoHelper.cache_user_coupons(data.user);
    Cache.hget(data.user._id, "checkin_map", function(err, reply) {
        if (err) {
            logger.error(err);
            deferred.resolve(data);
        } else {
            var cmap = JSON.parse(reply);
            if (!cmap)
                cmap = {};
            if (cmap[data.outlet._id]) {
                cmap[data.outlet._id] += 1;
            } else {
                cmap[data.outlet._id] = 1;
            }
            Cache.hset(data.user._id, "checkin_map", JSON.stringify(cmap), function(err) {
                if (err) {
                    logger.log(err);
                }
                deferred.resolve(data);
            });
        }
    });
    return deferred.promise;
}

function send_sms(data) {
    logger.log();
    var deferred = Q.defer();
    
    var payload = {};
    payload.from = 'TWYSTR';
    payload.message = data.message;
    payload.phone = data.phone;
    Transporter.send('sms', 'vf', payload);
    return deferred.promise;
}

var formatDate = function(date) {
    return dateFormat(date, "dd mmm yyyy");
};