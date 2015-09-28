'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var OutletHelper = require('./helpers/outlet.hlpr.js');
var RecoHelper = require('./helpers/reco.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var Q = require('q');
var Cache = require('../common/cache.hlpr');
var logger = require('tracer').colorConsole();

module.exports.new = function(req, res) {
  var token = req.query.token || null;
  var created_outlet = {};

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }
  created_outlet = _.extend(created_outlet, req.body);
  OutletHelper.create_outlet(token, created_outlet).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.update = function(req, res) {
  var token = req.query.token || null;
  var updated_outlet = {};
  updated_outlet = _.extend(updated_outlet, req.body);

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  OutletHelper.update_outlet(token, updated_outlet).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

function get_outlet(query, params) {
  var deferred = Q.defer();
  Cache.get('outlets', function(err, reply) {
    if (err) {
      deferred.reject('Could not get outlet');
    } else {
      var outlets = JSON.parse(reply);
      if (!outlets[query.outlet_id]) {
        deferred.reject('Could not find outlet');
      } else {
        deferred.resolve({
          query: params,
          outlet: outlets[query.outlet_id]
        });
      }
    }
  });

  return deferred.promise;
}

function get_user(params) {

  var deferred = Q.defer();
  if (params.query.token) {
    AuthHelper.get_user(params.query.token).then(function(data) {
      params.user = data.data;
      params.twyst_bucks = data.data.twyst_bucks;
      RecoHelper.cache_user_coupons(params.user);
      deferred.resolve(params);
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

  var deferred = Q.defer();
  if (params.user) {
    Cache.hget(params.user._id, "checkin_map", function(err, reply) {
      if (err || !reply) {
        deferred.resolve(params);
      } else {
        var cmap = JSON.parse(reply);
        params.outlet.recco = params.outlet.recco || {};
        params.outlet.recco.checkins = cmap[params.outlet._id];
        deferred.resolve(params);
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
        var outlet = params.outlet;
        if(social_pool) {
          _.each(social_pool, function(coupon) {
            if(outlet._id.toString() === coupon.issued_by) {
              outlet.offers.push(coupon);
            }
          });
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

  var deferred = Q.defer();
  if (params.user) {
    Cache.hget(params.user._id, 'coupon_map', function(err, reply) {
      if (err || !reply) {
        deferred.resolve(params);
      } else {
        var cmap = JSON.parse(reply);
        params.outlet.recco = params.outlet.recco || {};
        if (cmap[params.outlet._id]) {
          params.outlet.recco.coupons = cmap[params.outlet._id].length;
        }

        deferred.resolve(params);
      }
    });
  } else {
    deferred.resolve(params);
  }
  return deferred.promise;
}

function set_distance(params) {

  var deferred = Q.defer();
  if (params.query.lat && params.query.long) {
    params.outlet.recco = params.outlet.recco || {};
    params.outlet.recco.distance = RecoHelper.distance({
      latitude: params.query.lat,
      longitude: params.query.long
    }, params.outlet.contact.location.coords);

  }
  deferred.resolve(params);
  return deferred.promise;
}

function set_open_closed(params) {

  var deferred = Q.defer();
  if (params.query.date && params.query.time) {
    params.outlet.recco = params.outlet.recco || {};
    params.outlet.recco.closed = RecoHelper.isClosed(params.query.date,
      params.query.time,
      params.outlet.business_hours);

  }
  deferred.resolve(params);
  return deferred.promise;
}

function pick_outlet_fields(params) {
  var deferred = Q.defer();
  var fmap = null;
  var user = params.user && params.user._id || null;
  Cache.hget(user, 'favourite_map', function(err, reply) {
    if (reply) {
      fmap = JSON.parse(reply);
    }
    params.outlet.recco = params.outlet.recco || {};
    var massaged_item = {};
    massaged_item._id = params.outlet._id;
    massaged_item.name = params.outlet.basics.name;
    massaged_item.city = params.outlet.contact.location.city;
    massaged_item.address = params.outlet.contact.location.address;
    massaged_item.locality_1 = params.outlet.contact.location.locality_1[0];
    massaged_item.locality_2 = params.outlet.contact.location.locality_2[0];
    massaged_item.lat = params.outlet.contact.location.coords.latitude || null;
    massaged_item.long = params.outlet.contact.location.coords.longitude || null;
    massaged_item.distance = params.outlet.recco.distance || null;
    massaged_item.open = !params.outlet.recco.closed;
    massaged_item.phone = params.outlet.contact.phones.mobile[0] && params.outlet.contact.phones.mobile[0].num;
    massaged_item.offers = params.outlet.offers;
    massaged_item.attributes = params.outlet.attributes;
    if (fmap && fmap[params.outlet._id]) {
      massaged_item.following = true;
    } else {
      massaged_item.following = false;
    }

    if (params.outlet.photos && params.outlet.photos.logo) {
      massaged_item.logo = params.outlet.photos.logo;
    }
    if (params.outlet.photos && params.outlet.photos.background) {
      massaged_item.background = params.outlet.photos.background;
    }
    massaged_item.open_next = RecoHelper.opensAt(params.outlet.business_hours);
    params.outlet = massaged_item;
    deferred.resolve(params);
  });

  return deferred.promise;
}

function massage_offers(params) {
  var deferred = Q.defer();
  var coupon_map = null;
  if (params.user) {
    Cache.hget(params.user._id, 'coupon_map', function(err, reply) {
      if (err || !reply) {
        coupon_map = null;
      } else {
        coupon_map = JSON.parse(reply);
      }

      params.outlet = add_user_coupons(
        pick_offer_fields(
          select_relevant_checkin_offer(params.outlet), params.user._id, params.query.date, params.query.time), coupon_map && coupon_map[params.outlet._id] && coupon_map[params.outlet._id].coupons);
      params.outlet.offers = _.sortBy(params.outlet.offers, function(offer) {
          
        if(offer.type === 'coupon') {
          return -100;
        } else if(offer.offer_type === 'pool') {
          return -50;
        } else if(offer.next) {
          return offer.next;
        } else {
          return 100;
        }
          
      });
      deferred.resolve(params);

    });
  } else {
    params.outlet =
      pick_offer_fields(
        select_relevant_checkin_offer(params.outlet), params.user._id, params.query.date, params.query.time);
    deferred.resolve(params);
    deferred.resolve(params);
  }
  return deferred.promise;

  // PRIVATE FUNCTIONS
  function select_relevant_checkin_offer(item) {
    var checkins = (item.recco && item.recco.checkins || 0);
    var returned = false;

    // SORT BY THE EVENT COUNT
    item.offers = _.sortBy(item.offers, function(offer) {
      if (offer.offer_type === 'checkin') {
        if (offer.rule && offer.rule.event_count) {
          return offer.rule.event_count;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });

    // // AND THEN PICK THE FIRST ONE
    // item.offers = _.filter(item.offers, function(offer) {
    //   if (offer.offer_type === 'checkin') {
    //     if (checkins < offer.rule.event_count && !returned) {
    //       returned = true;
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   } else {
    //     if (offer.offer_type === 'winback' || offer.offer_type === 'birthday') {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   }
    // });

    return item;
  }

  function add_user_coupons(item, coupon_map) {
    if (item.offers && item.offers.length !== 0 && coupon_map !== null) {
        coupon_map = _.map(coupon_map, function(itemd) {
        var coupon = {};

        coupon._id = itemd && itemd._id;
        coupon.type = "coupon";
        coupon.code = itemd && itemd.code;
        coupon.status = itemd && itemd.status;
        coupon.header = itemd && itemd.title || itemd && itemd.header;
        coupon.line1 = itemd && itemd.detail || itemd && itemd.line1;
        coupon.line2 = itemd && itemd.line2;
        coupon.lapse_date = itemd && itemd.lapse_date;
        coupon.expiry = itemd && itemd.expiry_date;
        coupon.meta = {};
        coupon.meta.reward_type = itemd && itemd.meta && itemd.meta.reward_type.type;
        coupon.description = itemd.description;
        coupon.terms = itemd.terms;
        coupon.available_now = true;

        _.each(item.offers, function(offer) {
            if(offer._id.toString() === itemd.issued_for.toString()) {
                coupon.available_now = offer.available_now;
                if(!coupon.available_now) {
                  coupon.available_next = offer.available_next;
                }
                

            }
        });
        if (new Date(coupon.lapse_date) <= new Date()) {
          return false;
        } else {
          return coupon;
        }
      });
      coupon_map = _.compact(coupon_map);
      item.offers = item.offers.concat(coupon_map);
    }
    return item;
  }

  function pick_offer_fields(item, user_id, date, time) {

    item.offers = _.map(item.offers, function(offer) {
      if (offer.type) {
        return offer;
      } 
      else if(offer.offer_status === 'archived' || offer.offer_status === 'draft') {
        return false;
      }
      else {
        var massaged_offer = {};
        massaged_offer._id = offer._id;
        massaged_offer.header = offer.actions && offer.actions.reward && offer.actions.reward.header || offer.header;
        massaged_offer.line1 = offer.actions && offer.actions.reward && offer.actions.reward.line1 || offer.line1;
        massaged_offer.line2 = offer.actions && offer.actions.reward && offer.actions.reward.line2 || offer.line2;
        massaged_offer.description = offer.actions && offer.actions.reward && offer.actions.reward.description || '';
        massaged_offer.terms = offer.actions && offer.actions.reward && offer.actions.reward.terms || '';

        massaged_offer.type = offer.offer_type;
        massaged_offer.meta = offer.actions && offer.actions.reward && offer.actions.reward.reward_meta || offer.meta;
        if(offer.offer_type === 'pool') {         
          massaged_offer.available_now = true;          
          massaged_offer.lapsed_coupon_source = offer.lapsed_coupon_source;
          massaged_offer.code = offer.code;
          massaged_offer.meta.reward_type = offer.meta.reward_type.type;
        }
        
        if (offer.offer_type === 'checkin') {
          massaged_offer.checkins = item.recco && item.recco.checkins || 0;
          if (offer.rule.event_match === 'on every') {
            if(massaged_offer.checkins<offer.rule.event_start) {
              massaged_offer.next = offer.rule.event_start - massaged_offer.checkins; 
            } else if(massaged_offer.checkins>=offer.rule.event_start && massaged_offer.checks<=offer.rule.event_end) {
              massaged_offer.next = offer.rule.event_count - ((massaged_offer.checkins - offer.rule.event_start) % massaged_offer.event_count);
            } else {
              massaged_offer.next = -1;
            }
          }

          if (offer.rule.event_match === 'on only') {
            massaged_offer.next = parseInt(offer.rule && offer.rule.event_count);
            var checkins_to_go = massaged_offer.next - massaged_offer.checkins; 
            massaged_offer.next =  checkins_to_go; 
          }

          if (offer.rule.evnet_match === 'after' && offer.rule.event_start>massaged_offer.checkins) { // to remove
            console.log('after next', offers[i].checkin_count, event_start);
            var checkins_to_go = offer.rule.event_start - massaged_offer.checkins;
            massaged_offer.next = checkins_to_go;
          } else if(offer.rule.event_match === 'after' && offer.rule.event_start<=massaged_offer.checkins && offer.rule.event_end>massaged_offer.checkins) {
            massaged_offer.next = 1;
          } else if(offer.rule.event_match === 'after') {
            massaged_offer.next = -1;
          }

        }        

        massaged_offer.expiry = offer.offer_end_date || offer.expiry_date;
        
        if(offer.offer_likes && offer.offer_likes.length) {
          massaged_offer.offer_likes = offer.offer_likes.length;  
        }
        else{
          massaged_offer.offer_likes = 0;
        }

        massaged_offer.is_like = false;
        
        _.find(offer.offer_likes, function(user) {
            if(user.toString() === user_id.toString()) {
                massaged_offer.is_like = true;  
                return; 
            } 
        })

        if (offer && offer.actions && offer.actions.reward && offer.actions.reward.reward_hours) {
          massaged_offer.available_now = !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours));
          if (!massaged_offer.available_now) {
            massaged_offer.available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
          }

        }
        if(offer.offer_type === 'offer' || offer.offer_type === 'deal' || offer.offer_type ==='bank_deal') {
          massaged_offer.offer_cost =  offer.offer_cost;  
        }
        if(offer.offer_type === 'bank_deal') {
          massaged_offer.offer_source = offer.offer_source;
        }
        
        // massaged_offer.applicability = offer.actions.reward.applicability;
        // massaged_offer.valid_days = offer.actions.reward.valid_days;
        if(massaged_offer.next<=0) {
          return false;
        }

        if(massaged_offer.expiry && (new Date(massaged_offer.expiry) <= new Date())) {
          return false;
        }
        else{
          return massaged_offer;  
        }
        
      }

    });
    item.offers = _.compact(item.offers);
    return item;
  }
}

module.exports.get = function(req, res) {
  get_outlet(req.params, req.query)
    .then(function(data) {
      return get_user(data);
    })
    .then(function(data) {
      return set_user_checkins(data);
    })
    .then(function(data) {
      return set_social_pool_coupons(data);
    })
    .then(function(data) {
      return set_user_coupons(data);
    })
    .then(function(data) {
      return set_distance(data);
    })
    .then(function(data) {
      return set_open_closed(data);
    })
    .then(function(data) {
      return massage_offers(data);
    })
    .then(function(data) {
      return pick_outlet_fields(data);
    })
    .then(function(data) {
        var outlet = data.outlet;
        var twyst_bucks = data.twyst_bucks;
        var data = {};
        data.outlet = outlet;
        
        data.twyst_bucks = twyst_bucks;
        HttpHelper.success(res, data, "Got the outlet");
    })
    .fail(function(err) {
      HttpHelper.error(res, err || false, "Error getting the outlet");
    });
};

function filter_fields(req, data) {
  if (req.query.lat && req.query.long) {
    data.recco = data.recco || {};
    data.recco.distance = RecoHelper.distance({
      latitude: req.query.lat,
      longitude: req.query.long
    }, data.data.contact.location.coords);
  }
  return data;
}

module.exports.all = function(req, res) {
  var token = req.query.token || null;
  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  OutletHelper.get_all_outlets(token).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.remove = function(req, res) {
  var token = req.query.token || null;
  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
  }

  if (!req.params.outlet_id) {
    HttpHelper.error(res, null, "No outlet id passed");
  }

  OutletHelper.remove_outlet(token, req.params.outlet_id).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};
