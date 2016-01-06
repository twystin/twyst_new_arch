'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var Event = mongoose.model('Event');
var HttpHelper = require('../common/http.hlpr.js');
var RecoHelper = require('./helpers/reco.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var Cache = require('../common/cache.hlpr.js');
var _ = require('underscore');
var Q = require('q');
var logger = require('tracer').colorConsole();

function get_outlets(params) {
  logger.log();

  var deferred = Q.defer();
  Cache.get('outlets', function(err, reply) {
    if (err) {
      deferred.reject('Could not get outlets');
    } else {
      var outlets = JSON.parse(reply);
      outlets = _.map(outlets, function(outlet){
        if(outlet.menus && outlet.menus.length) {
          return outlet;
        }
      })
      console.log(outlets.length)
      deferred.resolve({
        query: params,
        outlets: outlets
      });
    }
  });

  return deferred.promise;
}

function get_user(params) {
  logger.log();

  var deferred = Q.defer();
  if (params.query.token) {
    AuthHelper.get_user(params.query.token).then(function(data) {
      params.user = data.data;
      params.twyst_bucks = data.data.twyst_bucks;
      RecoHelper.cache_user_coupons(params.user).then(function(data) {
        RecoHelper.cache_user_favourites(params.user).then(function(data) {
          deferred.resolve(params);
        }, function(err) {
          deferred.reject(err);
        })
      }, function(err) {
        deferred.reject(err);
      });
    }, function(err) {
      deferred.reject(err);
    });
  } else {
    params.user = null;
    deferred.resolve(params);
  }

  return deferred.promise;
}

function set_user_checkins(params) {
  logger.log();

  var deferred = Q.defer();
  if (params.user) {
    Cache.hget(params.user._id, "checkin_map", function(err, reply) {
      if (err || !reply) {
        deferred.resolve(params);
      } else {
        var cmap = JSON.parse(reply);
        var outlets = params.outlets;
        if (cmap) {
          _.each(cmap, function(value, key) {
            if(outlets[key]) {
              outlets[key].recco = outlets[key].recco || {};
              outlets[key].recco.checkins = value;
            }
          });
          params.outlets = outlets;
          deferred.resolve(params);
        } else {
          deferred.resolve(params);
        }
      }
    });
  } else {
    deferred.resolve(params);
  }
  return deferred.promise;
}

function set_user_coupons(params) {
  logger.log();
  var deferred = Q.defer();
  if (params.user) {
    Cache.hget(params.user._id, 'coupon_map', function(err, reply) {
      if (err || !reply) {
        deferred.resolve(params);
      } else {
        var cmap = JSON.parse(reply);
        var outlets = params.outlets;
        if (cmap) {
          _.each(cmap, function(value, key) {
            if (outlets[key]) {
              outlets[key].recco = outlets[key].recco || {};
              outlets[key].recco.coupons = value.coupons.length;
            }
          });
          params.outlets = outlets;
          deferred.resolve(params);
        } else {
          deferred.resolve(params);
        }
      }
    });
  } else {
    deferred.resolve(params);
  }
  return deferred.promise;
}

function set_social_pool_coupons(params) {
  logger.log();

  var deferred = Q.defer();
  if (params.user) {
    Cache.hget(params.user._id, 'social_pool_coupons', function(err, reply) {
      
      if(err || !reply) {
        deferred.resolve(params);
      } else {
        var social_pool = JSON.parse(reply);
        var outlets = params.outlets;
        if(social_pool) {
          _.each(social_pool, function(coupon) {
            if(outlets[coupon.issued_by]) {
              outlets[coupon.issued_by].offers.push(coupon)
            }
          });
          deferred.resolve(params);
        } else {
          deferred.resolve(params);
        }
      }
    })
  } else {
    deferred.resolve(params);
  }
  return deferred.promise;
}

function set_distance(params) {
  logger.log();

  var deferred = Q.defer();

  
  deferred.resolve(params);
  return deferred.promise;
}

function set_open_closed(params) {
  logger.log();

  var deferred = Q.defer();
  params.outlets = _.compact(params.outlets);
  if (params.query.date && params.query.time) {
    params.outlets = _.mapObject(params.outlets, function(val, key) {
      val.recco = val.recco || {};
      val.recco.closed = RecoHelper.isClosed(params.query.date,
        params.query.time,
        val.business_hours);
      return val;
    });
  }
  deferred.resolve(params);
  return deferred.promise;
}

function calculate_relevance(params) {
  logger.log();

  var deferred = Q.defer();
  
  deferred.resolve(params);
  return deferred.promise;
}

function sort_by_relevance(params) {
  logger.log();

  var deferred = Q.defer();
  

  deferred.resolve(params);
  return deferred.promise;
}

function pick_outlet_fields(params) {
  logger.log();

  var deferred = Q.defer();
  var fmap = null;
  var user = params.user && params.user._id || null;
  if (user) {
    user = user.toString();
  }
  params.outlets = _.compact(params.outlets);
  Cache.hget(user, 'favourite_map', function(err, reply) {
    if (reply) {
      fmap = JSON.parse(reply);
    }

    params.outlets = _.map(params.outlets, function(item) {
      if(item.outlet_meta.status === 'archived' || item.outlet_meta.status === 'draft') {
        return false;        
      }
      var massaged_item = {};
      massaged_item._id = item._id;
      massaged_item.name = item.basics.name;
      massaged_item.city = item.contact.location.city;
      massaged_item.address = item.contact.location.address;
      massaged_item.locality_1 = item.contact.location.locality_1[0];
      massaged_item.locality_2 = item.contact.location.locality_2[0];
      massaged_item.lat = item.contact.location.coords.latitude || null;
      massaged_item.long = item.contact.location.coords.longitude || null;
      massaged_item.distance = item.recco.distance || null;
      massaged_item.open = !item.recco.closed;
      massaged_item.phone = item.contact.phones.mobile[0] && item.contact.phones.mobile[0].num;  
      massaged_item.is_paying =  item.basics.is_paying;
      massaged_item.cuisines = item.attributes.cuisines;
      if (fmap && fmap[item._id]) {
        massaged_item.following = true;
      } else {
        massaged_item.following = false;
      }

      if (item.photos && item.photos.logo) {
        massaged_item.logo = 'https://s3-us-west-2.amazonaws.com/retwyst-merchants/retwyst-outlets/' + item._id + '/' + item.photos.logo;
      }
      if (item.photos && item.photos.background) {
        massaged_item.background = 'https://s3-us-west-2.amazonaws.com/retwyst-merchants/retwyst-outlets/' + item._id + '/' + item.photos.background;
      }
      massaged_item.open_next = RecoHelper.opensAt(item.business_hours);
      if(item.menus && item.menus.length) {
        massaged_item.menu = item.menus[0]._id;
      }
      
      console.log(massaged_item);
      return massaged_item;
    });
    
    
    params.outlets = _.compact(params.outlets);

    deferred.resolve(params);
  });

  return deferred.promise;
}



function paginate(params) {
  logger.log();

  var deferred = Q.defer();
  var start = params.query.start || 1;
  var end = params.query.end || undefined;
  params.outlets = params.outlets.slice(start - 1, end);
  deferred.resolve(params);
  return deferred.promise;
}

//TODO: Cache the recco set for pagination.
module.exports.get = function(req, res) {
  get_outlets(req.query)
    .then(function(data) {
      return get_user(data);
    })
    .then(function(data) {
      return set_user_checkins(data);
    })
    .then(function(data) {
      return set_user_coupons(data);
    })
    .then(function(data) {
      return set_social_pool_coupons(data);
    })
    .then(function(data) {
      return set_distance(data);
    })
    .then(function(data) {
      return set_open_closed(data);
    })
    .then(function(data) {
      return calculate_relevance(data);
    })
    .then(function(data) {
      return sort_by_relevance(data);
    })
    .then(function(data) {
      return pick_outlet_fields(data);
    })
    .then(function(data) {
      return paginate(data);
    })
    .then(function(data) {
        var outlets = data.outlets;
        var twyst_bucks = data.twyst_bucks;
        var data = {};
        data.outlets = outlets;
        data.twyst_bucks = twyst_bucks;
      HttpHelper.success(res, data, "Got the recos");
    })
    .fail(function(err) {
      HttpHelper.error(res, err || false, "Error getting reccos");
    });
};
