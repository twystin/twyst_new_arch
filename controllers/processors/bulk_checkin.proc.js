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
var ObjectId = mongoose.Types.ObjectId;
var async = require('async');

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
            deferred.resolve(data);
        })
        .fail(function(err) {
            deferred.reject(err);
        })
    return deferred.promise;
}


function validate_request(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    console.log()
    var phone = _.get(passed_data, 'event_data.event_meta.phone'),
        date = _.get(passed_data, 'event_data.event_meta.date'),
        date = new Date(date),
        today = new Date(),
        message = _.get(passed_data, 'event_data.event_meta.message'),
        sms_sender_id = _.get(passed_data, 'event_data.event_meta.sms_sender_id'),
        outlet = _.get(passed_data, 'event_data.event_meta.outlet');

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        deferred.reject('Phone number missing or invalid');
    }

    if (!date || date.getTime() > today.getTime()) {
        deferred.reject('Checkin-in cannot be set in the future');
    }

    if (!outlet) {
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

    var date = new Date(data.event_data.event_meta.date);
    console.log(date)
    var THREE_HOURS =  new Date(date.getTime() - 10800000);
    var FIVE_MINS = new Date(date.getTime() -  300000);

    var user_id = _.get(data, 'user._id');
    var outlet_id = _.get(data, 'outlet._id');
    console.log(THREE_HOURS)
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
                //console.log(event.event_date)
                //console.log(FIVE_MINS)
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
    
    calculate_checkin_counts(sorted_checkin_offers, user_id, function(err, offers_with_checkin_count){
        if(err) {
            deferred.reject(err);
        }
        var matching_offer = find_matching_offer(offers_with_checkin_count);
        
        if (matching_offer && isNaN(matching_offer)) {
            create_coupon(matching_offer, user_id, outlet_id).then(function(data) {
                if (data.coupons && data.coupons.length) {
                    passed_data.new_coupon = data.coupons[data.coupons.length-1];
                    passed_data.user.coupons.push(data.coupons[data.coupons.length - 1]);
                }
                //console.log(passed_data.outlet)
                if(passed_data.outlet.contact.location.locality_1) {
                    passed_data.message = 'Check-in successful at '+ passed_data.outlet.basics.name +','  + passed_data.outlet.contact.location.locality_1.toString()+' on '+ formatDate(new Date(passed_data.event_data.event_meta.date)) +". Reward unlocked! Your voucher will be available on your Twyst app soon. Don't have the app? Get it now at http://twy.st/app";                
                    
                }
                else{
                    passed_data.message = 'Check-in successful at '+ passed_data.outlet.basics.name +','  + passed_data.outlet.contact.location.locality_2.toString()+' on '+ formatDate(new Date(passed_data.event_data.event_meta.date)) +". Reward unlocked! Your voucher will be available on your Twyst app soon. Don't have the app? Get it now at http://twy.st/app";                                    
                }
                
                deferred.resolve(passed_data);
            }, function(err) {
                deferred.reject('Could not create coupon' + err);
            })
        } else if (!isNaN(matching_offer)) {
            console.log('locked_offer');
            if(passed_data.outlet.contact.location.locality_1) {
                passed_data.message = 'Check-in successful at '+ passed_data.outlet.basics.name + ','  + passed_data.outlet.contact.location.locality_1.toString()+' on '+ formatDate(new Date(passed_data.event_data.event_meta.date)) +'. You are '+ matching_offer +' check-in(s) away from your next reward. Find '+ passed_data.outlet.basics.name + ' on Twystat http://twy.st/app';                
                
            }
            else{
                passed_data.message = 'Check-in successful at '+ passed_data.outlet.basics.name + ','  + passed_data.outlet.contact.location.locality_2.toString()+' on '+ formatDate(new Date(passed_data.event_data.event_meta.date)) +'. You are '+ matching_offer +' check-in(s) away from your next reward. Find '+ passed_data.outlet.basics.name + ' on Twystat http://twy.st/app';                                    
            }
            
            passed_data.checkins_to_go = matching_offer;
            deferred.resolve(passed_data);
        } else {
            deferred.reject('no matching offer for user');
        }        
    })
    return deferred.promise;
}

function calculate_checkin_counts(sorted_offers, user_id, callback) {
    logger.log();
    
    //console.log(passed_data.outlet.offers)
    var offers = [];
    async.each(sorted_offers, function(offer, callback) {
        var outlets = _.map(offer.offer_outlets, function(offer_id){
            return ObjectId(offer_id);
        })
        var start_date = new Date(offer.offer_start_date);
        var end_date = new Date(offer.offer_end_date);

        Event.find({
            event_user: user_id,
            event_type: 'checkin',
            event_outlet: {$in: outlets},
            event_date: {$gte: start_date, $lte: end_date}

        }).exec(function(err, events) {
            if (err) {
                console.log(err)
                callback(err);
            } else {
                offer.checkin_count = events.length+1;                
                offers.push(offer);
                callback();
            }
        });
        
    }, function(err) {
        if(err) {
            callback(err);    
        }
        else{
            callback(null, offers);    
        }
        
    });
}

function find_matching_offer(offers) {
    logger.log();
    var i, next = [];
    var count, match, event_start, event_end ;

    for (i = 0; i < offers.length; i++) {

        count = _.get(offers[i], 'rule.event_count');
        match = _.get(offers[i], 'rule.event_match');
        event_start = _.get(offers[i], 'rule.event_start');
        event_end = _.get(offers[i], 'rule.event_end');

        if (match === 'on every') {
            console.log('on every', count, event_start, event_end, offers[i].checkin_count);
            if (offers[i].checkin_count % count === 0 && offers[i].checkin_count >= event_start && offers[i].checkin_count <= event_end) {
                return ( offers[i]);
            }
        }

        if (match === 'on only') {
            console.log('on only', count, offers[i].checkin_count );
            if (offers[i].checkin_count === count) {
                return ( offers[i]);
            }
        }

        if (match === 'after') {
            console.log('after', event_start, offers[i].checkin_count);
            if (offers[i].checkin_count >= event_start && offers[i].checkin_count <= event_end) {
                return ( offers[i]);
            }
        }

        if (match === 'on every' && offers[i].checkin_count >= event_start && offers[i].checkin_count <= event_end) {
            console.log('on every', count, event_start, event_end,  offers[i].checkin_count);
            var checkins_to_go = count - (offers[i].checkin_count % count);
            next.push(checkins_to_go);
        }

        if (match === 'on only') {
            console.log('on only', count , offers[i].checkin_count);
            if (count > offers[i].checkin_count) {
                var checkins_to_go = count - offers[i].checkin_count;
                next.push(checkins_to_go);
            }
        }

        if (match === 'after' && event_start >= offers[i].checkin_count) {
            console.log('after', event_start , offers[i].checkin_count);
            var checkins_to_go = event_start - offers[i].checkin_count;
            next.push(checkins_to_go);
        }
    }
    
    if (next.length) {
        return _.sortBy(next, function(num) {
            return ( num);
        })[0];
    } else {
        return ( undefined);
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
    console.log('herte')
    var lapse_date = new Date();
    lapse_date.setDate(lapse_date.getDate() + offer.offer_lapse_days);
    var expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + offer.offer_valid_days);

    var deferred = Q.defer();

    var coupon = {
        _id: mongoose.Types.ObjectId(),
        code: code,
        issued_for: offer._id,
        coupon_source: 'BULK',
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
  
  Cache.hget(data.user._id, "checkin_map", function(err, reply) {
    if(err) {
      logger.error(err);
      deferred.resolve(data);
    } else {
      var cmap = JSON.parse(reply);
      if(!cmap)
        cmap = {};
      if(data.new_coupon) {
        _.each(data.new_coupon.outlets, function(outlet) {
          if(cmap[outlet]) {
            cmap[outlet] += 1;
          } else {
            cmap[outlet] = 1;
          }
        });
        Cache.hset(data.user._id, "checkin_map", JSON.stringify(cmap), function(err) {
          if(err) {
            logger.log(err);
          }
          deferred.resolve(data);
        });
      } else {
        User.findOne({
          role: 3,
          outlets: {
            $in: [ObjectId(data.event_data.event_outlet || data.outlet._id)]
          }
        }).exec(function(err, merchant_account) {
          if(err || !merchant_account) {
            logger.error(err);
            deferred.resolve(data);
          } else {
            _.each(merchant_account.outlets, function(outlet) {
              if(cmap[outlet]) {
                cmap[outlet] += 1;
              } else {
                cmap[outlet] = 1;
              }
            })
            Cache.hset(data.user._id, "checkin_map", JSON.stringify(cmap), function(err) {
              if(err) {
                logger.log(err);
              }
              deferred.resolve(data);
            });
          }
        });
      }
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
    payload.phone = data.event_data.event_meta.phone;
    console.log(payload)
    Transporter.send('sms', 'vf', payload);
    
    deferred.resolve(data);
    return deferred.promise;
}

var formatDate = function(date) {
    return dateFormat(date, "dd mmm yyyy");
};