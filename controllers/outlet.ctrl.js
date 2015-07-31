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
      massaged_item.logo = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + params.outlet._id + '/' + params.outlet.photos.logo;
    }
    if (params.outlet.photos && params.outlet.photos.background) {
      massaged_item.background = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + params.outlet._id + '/' + params.outlet.photos.background;
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
          select_relevant_checkin_offer(params.outlet)), coupon_map && coupon_map[params.outlet._id] && coupon_map[params.outlet._id].coupons);
      deferred.resolve(params);

    });
  } else {
    params.outlet =
      pick_offer_fields(
        select_relevant_checkin_offer(params.outlet));
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
        coupon.type = "coupon";
        coupon.status = itemd && itemd.status;
        coupon.title = itemd && itemd.title;
        coupon.terms = itemd && itemd.detail;
        coupon.expiry = itemd && itemd.expiry;
        return coupon;
      });
      item.offers = item.offers.concat(coupon_map);
    }
    return item;
  }

  function pick_offer_fields(item) {
    item.offers = _.map(item.offers, function(offer) {
      if (offer.type) {
        return offer;
      } else {
        var massaged_offer = {};
        massaged_offer.type = offer.offer_type;
        massaged_offer.title = offer.actions && offer.actions.reward && offer.actions.reward.title;
        massaged_offer.terms = offer.actions && offer.actions.reward && offer.actions.reward.terms;
        massaged_offer.next = parseInt(offer.rule && offer.rule.event_count);
        massaged_offer.checkins = item.recco && item.recco.checkins || 0;
        massaged_offer.meta = offer.actions && offer.actions.reward && offer.actions.reward.reward_meta;
        massaged_offer.expiry = offer.actions.reward.expiry;
        if (offer && offer.actions && offer.actions.reward && offer.actions.reward.reward_hours) {
          massaged_offer.available_now = !(RecoHelper.isClosed('dummy', 'dummy', offer.actions.reward.reward_hours));
          if (!massaged_offer.available_now) {
            massaged_offer.available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
          }
        }
        // massaged_offer.applicability = offer.actions.reward.applicability;
        massaged_offer.valid_days = offer.actions.reward.valid_days;
        massaged_offer.header = offer.actions.reward.header;
        massaged_offer.line1 = offer.actions.reward.line1;
        massaged_offer.line2 = offer.actions.reward.line2;
        massaged_offer.offer_likes = offer.offer_likes;
        return massaged_offer;
      }

    });
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
      HttpHelper.success(res, data.outlet, "Got the outlet");
    })
    .fail(function(err) {
      HttpHelper.error(res, err || false, "Error getting the outlet");
    });
};

function filter_fields(req, data) {
  if (req.query.lat && req.query.long) {
    data.recco = data.recco || {};
    console.log(data.data.contact.location.coords);
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
