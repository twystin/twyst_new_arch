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
var Outlet = mongoose.model('Outlet');

module.exports.get_coupons = function(req, res) {
  logger.log();
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  else{
    AuthHelper.get_user(req.query.token).then(function(user) {
      var data = {};
      data.query = req.query;
      data.user = user;
      
      if (user.data.role >= 6) {
        data.coupons = user.data.coupons;
        data.twyst_bucks = user.data.twyst_bucks;
        filter_out_expired_and_used_coupons(data)
          .then(function(data) {
            return load_outlet_info_from_cache(data)
          }).then(function(data) {
            var twyst_bucks;
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
      } else {
        var phone_number = req.query.phone || null;

        if(!phone_number) {
          HttpHelper.error(res, null, "Phone number required");
        }

        data.phone_number = phone_number;
        get_coupons_for_user(data)
          .then(function(data) {
            return filter_out_expired_and_used_coupons(data);
          }).then(function(data) {
            return load_outlet_info_from_cache(data)
          }).then(function(data) {
            console.log(data.coupons);
            var coupons = data.coupons;
            var data = {};
            data.coupons = coupons;
            HttpHelper.success(res, data, 'message');
          })
          .fail(function(err) {
            console.log(err);
            HttpHelper.error(res, err, 'Couldn\'t find the user coupons');
          });
      }
    }, function(err) {
      HttpHelper.error(res, err, 'Couldn\'t find the user');
    });  
  }
  
};

module.exports.get_profile = function(req, res) {
  logger.log();
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  else{
    AuthHelper.get_user(req.query.token).then(function(data) {
      HttpHelper.success(res, data.data, "Found user");
    }, function(err) {
      HttpHelper.error(res, err, "Could not find user");
    });  
  }
  
};

module.exports.update_profile = function(req, res) {
  logger.log();
  var token = req.query.token || null;
  var updated_user = {};
  updated_user = _.extend(updated_user, req.body);
  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  else{
      UserHelper.update_user(token, updated_user).then(function(data) {
      HttpHelper.success(res, data.data, data.message);
    }, function(err) {
      HttpHelper.error(res, err.err, err.message);
    });
  }
  
};

module.exports.update_friends = function(req, res) {
  logger.log();
  var token = req.query.token || null;
  var friend_list = {};
  friend_list = _.extend(friend_list, req.body);
  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  else{
    UserHelper.update_friends(token, friend_list).then(function(data) {
      HttpHelper.success(res, data.data, data.message);
    }, function(err) {
      HttpHelper.error(res, err.err, err.message);
    });  
  }
  
};

function get_coupons_for_user(data) {
  logger.log();
  var deferred = Q.defer();
  
  User.findOne({
    phone: data.phone_number
  }).exec(function(err, user) {
    if(err || !user) {
      logger.log(err);
      deferred.reject({
        data: null,
        message: 'Unable to load coupons for this number'
      });
    } else {
      user = user.toJSON();
      var merchant_outlets = _.map(data.user.data.outlets, function(outlet) {
        return outlet.toString(); 
      });
      var filtered_coupons = _.filter(user.coupons, function(coupon) {
        var coupon_outlets = _.map(coupon.outlets, function(outlet) { 
          return outlet.toString(); 
        });
        var outlet_match = _.find(coupon_outlets, function(outlet) {
          return merchant_outlets.indexOf(outlet)!==-1;
        });
        if(outlet_match) {
          return true;
        } else {
          return false;
        }
      });
      deferred.resolve(data);
    }
  });

  return deferred.promise;
}

function filter_out_expired_and_used_coupons(data) {
  logger.log();
  var deferred = Q.defer();
  data.coupons = _.filter(data.coupons, function(coupon) {
    if(_.has(coupon, 'status') && (coupon.status === 'active' && coupon.lapse_date && new Date(coupon.lapse_date) > new Date()) 
        && ( coupon.coupon_source === 'QR' || coupon.coupon_source === 'PANEL' || coupon.coupon_source === 'POS' 
            || coupon.coupon_source === 'BATCH' || coupon.coupon_source === 'qr_checkin' || coupon.coupon_source === 'panel_checkin'
            || coupon.coupon_source === 'bulk_checkin' || coupon.coupon_source === 'mrl_checkin' || coupon.coupon_source === 'upload_bill') && new Date(coupon.issued_at) < new Date(Date.now() - 10800000)) {
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
                var _coupons = [];
                async.each(data.coupons, function(coupon, callback) {
                    var massaged_item = {};
                    var today = new Date(),
                    date = (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getFullYear(),
                    time = (today.getHours() + 5) + ':' + (today.getMinutes() + 30);
                    if(coupon.issued_by) {
                      outlet = outlets[coupon.issued_by.toString()];                        
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

                    if (data.query.lat && data.query.long) {
                      massaged_item.distance = RecoHelper.distance({latitude: data.query.lat, longitude: data.query.long}, outlet.contact.location.coords);
                    }

                    if (outlet.photos && outlet.photos.logo) {
                        massaged_item.logo = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + outlet._id + '/' + outlet.photos.logo;
                    }
                    if (outlet.photos && outlet.photos.background) {
                        massaged_item.background = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + outlet._id + '/' + outlet.photos.background;
                    }
                    massaged_item.open_next = RecoHelper.opensAt(outlet.business_hours);
                    
                    _.each(outlet.offers, function(offer) {
                        if(offer._id && coupon.issued_for && offer._id.toString() === coupon.issued_for.toString()) {
                            coupon.available_now = !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours));
                            if(!coupon.available_now) {
                              coupon.available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
                            }
                            coupon.meta = {};
                            coupon.meta.reward_type = offer.actions.reward.reward_meta.reward_type;                                        
                        }
                        
                    });

                    Outlet.find({'offers._id': coupon.issued_for}, function (err, all_outlets) {
                        if(err) {
                            console.log(err);
                            callback();
                        }
                        else {
                            var outlets = [];
                            if(all_outlets.length){
                                _.each(all_outlets, function(outlet){
                                    var obj = {
                                        _id: outlet._id,
                                        name: outlet.basics.name,
                                        location_1: outlet.contact.location.locality_1,
                                        location_2: outlet.contact.location.locality_2,
                                        city: outlet.contact.location.city
                                    }
                                    outlets.push(obj);
                                });                            
                                coupon.outlets = outlets;
                                coupon.type = 'coupon';
                                coupon.expiry = coupon.expiry_date;
                                massaged_item.offers = [];
                                massaged_item.offers.push(coupon);
                                
                                _coupons.push(massaged_item);
                                
                                callback();
                            } 
                            else {
                                coupon.type = 'coupon';
                                coupon.expiry = coupon.expiry_date;
                                massaged_item.offers = [];
                                massaged_item.offers.push(coupon);
                                _coupons.push(massaged_item);
                                
                                callback();
                            }
                        }                        
                           
                    })
                                
                }, function() {
                  data.coupons = _coupons;
                  deferred.resolve(data);
                });           
            
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

module.exports.update_location = function(req, res) {
  logger.log();
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  else{
    UserHelper.update_user(req.query.token, req.body).then(function(data) {
      HttpHelper.success(res, data.data, "user location updated");
    }, function(err) {
      HttpHelper.error(res, err, "Could not find user");
    });  
  }
  
};

module.exports.cancel_order = function(req, res) {
  logger.log();
  var token = req.query.token || null;
  var order = {};
   order = _.extend( order, req.body);

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  else if (!order.reason) {
    HttpHelper.error(res, null, "please pass order cancel reason");
  }
  else if (!order.order_id) {
    HttpHelper.error(res, null, "please pass order id");
  }
  else{
    UserHelper.cancel_order(token, order).then(function(data) {
      HttpHelper.success(res, data.data, data.message);
    }, function(err) {
      HttpHelper.error(res, err.data, err.message);
    });  
  }
  
};
