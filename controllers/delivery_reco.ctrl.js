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
var geolib = require('geolib');

function get_outlets(params) {
  logger.log();

  var deferred = Q.defer();
  Cache.get('outlets', function(err, reply) {
    if (err) {
      deferred.reject('Could not get outlets');
    } else {
      
      deferred.resolve({
        query: params,
        outlets: JSON.parse(reply)
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


function set_distance(params) {
  logger.log();

  var deferred = Q.defer();
  if (params.query.lat && params.query.long) {
    params.outlets = _.mapObject(params.outlets, function(val, key) {
      val.recco = val.recco || {};
      val.recco.distance = RecoHelper.distance({
        latitude: params.query.lat,
        longitude: params.query.long
      }, val.contact.location.coords);
      return val;
    });
  }
  deferred.resolve(params);
  return deferred.promise; 
}

function set_open_closed(params) {
  logger.log();

  var deferred = Q.defer();
  params.outlets = _.compact(params.outlets);
  //console.log(params.outlets)
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

function map_valid_delivery_zone(params) {
  logger.log();
  var deferred = Q.defer();

  if (params.query.lat && params.query.long) {
    params.outlets = _.map(params.outlets, function(val) {    
      if(val.attributes.delivery.delivery_zone && val.attributes.delivery.delivery_zone.length) {        
        var delivery_zone = _.map(val.attributes.delivery.delivery_zone, function(current_zone) {          
          //check if coord exists for delivery zone
          if(current_zone.coord && current_zone.coord.length &&
            geolib.isPointInside({latitude: params.query.lat, longitude: params.query.long},
            current_zone.coord)){
            return current_zone;
          }
          else{
            return null;
          }
        })

        delivery_zone = _.compact(delivery_zone);
        if(delivery_zone.length) {
          delivery_zone =  _.max(delivery_zone, function(zone){ return zone.zone_type});
          if(delivery_zone) {
            val.valid_zone = delivery_zone;
            return val; 
          }
          else{
            return null;
          }  
        }
        else{
          return null;
        }
      }
      else{
        return null; 
      }
    });
    deferred.resolve(params);  
  }
  else{
    deferred.reject('please pass lat,long to get results');
  }
  
  return deferred.promise;  
}

function set_delivery_experiance(params) {
  logger.log();
  var deferred = Q.defer();
  
  params.outlets = _.mapObject(params.outlets, function(val, key) {
    val.recco = val.recco || {};
    val.recco.delivery_experiance = null;
    return val;
  });
  
  deferred.resolve(params);
  return deferred.promise;
}

function calculate_relevance(params) {
  logger.log();
  var deferred = Q.defer();
  params.outlets = _.compact(params.outlets);
  params.outlets = _.map(params.outlets, function(val) {
    var relevance = 10000;
    val.recco = val.recco || {};
    
    relevance = relevance - val.valid_zone.delivery_estimated_time;
    relevance = relevance - val.valid_zone.min_amt_for_delivery*100;
    val.recco.relevance = relevance;
    return val;
  });
  
  deferred.resolve(params);
  return deferred.promise;
}

function sort_by_relevance(params) {
  logger.log();

  var deferred = Q.defer();
  
  params.outlets = _.sortBy(params.outlets, function(item) {
    return -item.recco.relevance;
  });

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

      if(!item.menus.length) {
        return false;        
      }

      if(item.twyst_meta.cashback_info && !item.twyst_meta.cashback_info.base_cashback) {
        return false;
      }

      if(item.twyst_meta.twyst_commission && item.twyst_meta.twyst_commission.value === 0 && item.twyst_meta.twyst_commission.commission_slab.length) {
        return false;
      }

      if(!item.basics.account_mgr_email || !item.basics.account_mgr_phone) {
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
      massaged_item.delivery_experiance = item.recco.delivery_experiance || null;
      massaged_item.delivery_time = item.valid_zone.delivery_estimated_time;
      massaged_item.minimum_order = item.valid_zone.min_amt_for_delivery;
      massaged_item.payment_options = item.valid_zone.payment_options;
      massaged_item.delivery_conditions = item.valid_zone.delivery_conditions;
      if(item.twyst_meta.cashback_info && item.twyst_meta.cashback_info.base_cashback) {
        var cod_cashback = 0, inapp_cashback = 0, order_amount_cashback = 0;
        var base_cashback = item.twyst_meta.cashback_info.base_cashback;
        if(item.twyst_meta.cashback_info.order_amount_slab.length) {
          order_amount_cashback = _.find(item.twyst_meta.cashback_info.order_amount_slab, function(slab){
            if(slab.start && !slab.end) {
                return slab.ratio*base_cashback;
            }
          });  
        }
              
        inapp_cashback = item.twyst_meta.cashback_info.in_app_ratio *base_cashback;
        cod_cashback = item.twyst_meta.cashback_info.cod_ratio * base_cashback;

        var cashback = _.max([base_cashback, order_amount_cashback, inapp_cashback, cod_cashback], function(cashback){ return cashback; });
        massaged_item.cashback = cashback;
      }
      else{
        massaged_item.cashback = 0;
      }
      
      massaged_item.delivery_zones = item.delivery_zones;
      massaged_item.offer_count = item.offers.length;
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
      return set_distance(data);
    })
    .then(function(data) {
      return set_open_closed(data);
    })
    .then(function(data) {
      return set_delivery_experiance(data);
    })
    .then(function(data) {
      return map_valid_delivery_zone(data);
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
