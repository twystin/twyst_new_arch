'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var UserHelper = require('./helpers/user.hlpr.js');
var _ = require('lodash');
var mongoose = require('mongoose');
var Cache = require('../common/cache.hlpr');
var RecoHelper = require('./helpers/reco.hlpr.js');
var Q = require('q');
var async = require('async');
var logger = require('tracer').colorConsole();
var User = mongoose.model('User');

module.exports.get_coupons = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  AuthHelper.get_user(req.query.token).then(function(user) {
    var data = {};
    data.query = req.query;
    data.coupons = user.data.coupons;
    data.user = user;
    data.twyst_bucks = user.data.twyst_bucks;
    filter_out_expired_and_used_coupons(data)
      .then(function(data) {
        return load_outlet_info_from_cache(data)
      })
      .then(function(data) {
        var twyst_bucks
        if(data.coupons && data.coupons.length){ 
            twyst_bucks = data.twyst_bucks;
        }
        else{
            twyst_bucks = data.data.twyst_bucks;
        }
        var coupons = data.coupons;   
        
        var message = data.message;
        var data = {};
        data.coupons = coupons;
        data.twyst_bucks = twyst_bucks;
        HttpHelper.success(res, data, message);
      })
      .fail(function(err) {
        console.log(err)
        HttpHelper.error(res, err, 'Couldn\'t find the user coupons');
      });
  }, function(err) {
    HttpHelper.error(res, err, 'Couldn\'t find the user');
  });
};

module.exports.get_profile = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  AuthHelper.get_user(req.query.token).then(function(data) {
    HttpHelper.success(res, data.data, "Found user");
  }, function(err) {
    HttpHelper.error(res, err, "Could not find user");
  });
};

module.exports.update_profile = function(req, res) {

  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  var updated_user = {};
  updated_user = _.extend(updated_user, req.body);

  UserHelper.update_user(token, updated_user).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
};

module.exports.update_friends = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  var friend_list = {};
  friend_list = _.extend(friend_list, req.body);

  UserHelper.update_friends(token, friend_list).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
};


function filter_out_expired_and_used_coupons(data) {
  logger.log();
  var deferred = Q.defer();
  
  data.coupons = _.filter(data.coupons, function(coupon) {
    if(_.has(coupon, 'status') && (coupon.status === 'active') && (coupon.coupon_source === 'qr_checkin')) {
      return true;
    } else {
      return false;
    }
  });

  deferred.resolve(data);
  return deferred.promise;
};

function load_outlet_info_from_cache(data) {
  logger.log();
  var deferred = Q.defer();

  Cache.get('outlets', function(err, reply) {

    if(err || !reply) {
      deferred.reject({
        message: 'Outlet info unavailable',
        data: null
      });
    } else {
        var outlets = JSON.parse(reply) || [];
        var outlet;
        var fmap = null;
    
        Cache.hget(data.user._id, 'favourite_map', function(err, reply) {
            if (reply) {
              fmap = JSON.parse(reply);
            }
            if(data.coupons && data.coupons.length) {
                data.coupons = _.map(data.coupons, function(coupon) {
                    var massaged_item = {};
                    if(coupon.outlets && coupon.outlets.length) {
                        outlet = outlets[coupon.outlets[0].toString()];        
                    }
                    
                    massaged_item._id = outlet._id;
                    massaged_item.name = outlet.basics.name;
                    massaged_item.city = outlet.contact.location.city;
                    massaged_item.address = outlet.contact.location.address;
                    massaged_item.locality_1 = outlet.contact.location.locality_1[0];
                    massaged_item.locality_2 = outlet.contact.location.locality_2[0];
               
                    massaged_item.phone = outlet.contact.phones.mobile[0] && outlet.contact.phones.mobile[0].num;
                    
                    if (fmap && fmap[outlet._id]) {
                        massaged_item.following = true;
                    } else {
                        massaged_item.following = false;
                    }

                    if (outlet.photos && outlet.photos.logo) {
                        massaged_item.logo = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + outlet._id + '/' + outlet.photos.logo;
                    }
                    if (outlet.photos && outlet.photos.background) {
                        massaged_item.background = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + outlet._id + '/' + outlet.photos.background;
                    }
                    massaged_item.open_next = RecoHelper.opensAt(outlet.business_hours);
                    _.each(outlet.offers, function(offer) {
                        if(_.has(offer, ['actions', 'reward']) && _.isEqual(offer.actions.reward.header, coupon.header) && _.isEqual(offer.actions.reward.line1, coupon.line1) && _.isEqual(offer.actions.reward.line2, coupon.line2)) {
                            coupon.available_now = !(RecoHelper.isClosed('dummy', 'dummy', offer.actions.reward.reward_hours));
                            if(!coupon.available_now) {
                              coupon.available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
                            }
                            coupon.meta = {};
                            coupon.meta.reward_type = offer.actions.reward.reward_meta.reward_type;
                        }
                    });
                    coupon.type = 'coupon';
                    coupon.expiry = coupon.expiry_date;
                    massaged_item.offers = [];
                    massaged_item.offers.push(coupon);
                    return massaged_item; 
                })         
                
                deferred.resolve(data);   
            
            }
            else {
                deferred.resolve({
                    message: 'You do not have any coupon',
                    data: data
                });
            }  
        })
    }
    
  });
  return deferred.promise;
};

