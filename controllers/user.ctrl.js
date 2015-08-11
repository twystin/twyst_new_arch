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

module.exports.get_coupons = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  AuthHelper.get_user(req.query.token).then(function(user) {
    var data = {};
    logger.info(user.data)
    data.query = req.query;
    data.coupons = user.data.coupons;
    data.twyst_bucks = user.data.twyst_bucks;
    filter_out_inactive_coupons(data)
      .then(function(data) {
        return load_outlet_info_from_cache(data)
      })
      .then(function(data) {
        return filter_out_fields(data)
      })
      .then(function(data) {
        return clean_up_fields(data)
      })
      .then(function(data) {
        HttpHelper.success(res, data, 'Returning users coupons');
      })
      .fail(function(err) {
        HttpHelper.error(res, err, 'Couldn\'t find the user');
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
    HttpHelper.success(res, data, "Found user");
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

function filter_out_inactive_coupons(data) {
  logger.log();
  var deferred = Q.defer();

  data.coupons_mapped = [];

  data.coupons = _.filter(data.coupons, function(coupon) {
    if(_.has(coupon, 'status') && (coupon.status == 'active')) {
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

      _.each(data.coupons, function(coupon) {
        var outlet = _.cloneDeep(outlets[coupon.outlets[0].toString()]);

        outlet.coupons = [];
        outlet.coupons.push(coupon);
        delete outlet.coupons[0].used_details;
        _.each(outlet.offers, function(offer) {
          if(_.has(offer, ['actions', 'reward']) && _.isEqual(offer.actions.reward.header, coupon.header) && _.isEqual(offer.actions.reward.line1, coupon.line1) && _.isEqual(offer.actions.reward.line2, coupon.line2)) {
            outlet.coupons[0].available_now = !(RecoHelper.isClosed('dummy', 'dummy', offer.actions.reward.reward_hours));
            if(!outlet.coupons[0].available_now) {
              outlet.coupons[0].available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
            }
          }
        });
        data.coupons_mapped.push(outlet);
      });
      deferred.resolve(data);
    }
  });
  return deferred.promise;
};

function filter_out_fields(data) {
  logger.log();
  var deferred = Q.defer();

  async.each(data.coupons_mapped, function(entry, callback) {
    if(_.has(entry, 'basics')) {
      entry.name = entry.basics.name || '';  
    } else {
      entry.name = '';
    }
    
    if(_.has(entry, ['contact', 'location'])) {
      entry.city = entry.contact.location.city || '';
      entry.address = entry.contact.location.address || '';
      if(entry.contact.location.locality_1) {
        entry.locality_1 = entry.contact.location.locality_1[0] || '';  
      } else {
        entry.locality_1 = '';
      }
      
      if(entry.contact.location.locality_2) {
        entry.locality_2 = entry.contact.location.locality_2[0] || '';
      } else {
        entry.locality_2 = '';
      }
    } else {
      entry.city = '';
      entry.address = '';
      entry.locality_1 = '';
      entry.locality_2 = ''
    }
    
    if(_.has(entry, ['contact', 'phones', 'mobile']) && entry.contact.phones.mobile.length) {
      entry.phone = entry.contact.phones.mobile[0] && entry.contact.phones.mobile[0].num;  
    } else {
      entry.phone = '';
    }
    
    entry.distance = RecoHelper.distance({
      latitude: parseFloat(data.query.lat || 77.044028),
      longitude: parseFloat(data.query.long || 28.457984)
      }, entry.contact.location.coords);

    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      now = new Date((new Date()).getTime() + 19800000),
      day = days[now.getDay()],
      now_min = (now.getHours() * 60) + now.getMinutes();

    entry.open = !RecoHelper.isClosed(data.query.date,
      data.query.time,
      entry.business_hours);

    if (entry.photos && entry.photos.logo) {
      entry.logo = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + entry._id + '/' + entry.photos.logo;
    }
    if (entry.photos && entry.photos.background) {
      entry.background = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + entry._id + '/' + entry.photos.background;
    }
    if(!entry.open) {
      entry.open_next = RecoHelper.opensAt(entry.business_hours);
    }

    callback();
  }, function(err) {
    deferred.resolve(data);
  });
  
  return deferred.promise;
};

function clean_up_fields(data) {
  logger.log();
  var deferred = Q.defer();

  _.each(data.coupons_mapped, function(entry) {
    delete entry.basics;
    delete entry.contact;
    delete entry.links;
    delete entry.business_hours;
    delete entry.attributes;
    delete entry.photos;
    delete entry.outlet_meta;
    delete entry.twyst_meta;
    delete entry.sms_off; 
    delete entry.offers;
    delete entry.coupons[0].outlets;
  });
  delete data.query;
  data.coupons = _.cloneDeep(data.coupons_mapped);
  delete data.coupons_mapped;
  
  deferred.resolve(data);
  return deferred.promise;
};