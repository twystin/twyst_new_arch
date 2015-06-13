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

function get_outlets(params) {
  var deferred = Q.defer();
  if (!Cache.outlets) {
    Outlet.find({}).lean().exec(function(err, outlets) {
      if (err || outlets.length === 0) {
        deferred.reject('Could not get outlets');
      } else {
        var reduced_outlets = _.reduce(outlets, function(memo, item) {
          memo[item._id] = item;
          return memo;
        }, {});
        Cache.outlets = reduced_outlets;
        deferred.resolve({query:params, outlets:reduced_outlets});
      }
    });
  } else {
    deferred.resolve({query: params, outlets: Cache.outlets});
  }

  return deferred.promise;
}

function get_user(params) {
  var deferred = Q.defer();
  if (params.query.token) {
    AuthHelper.get_user(params.query.token).then(function(data) {
      params.user = data.data;
      if (params.user.coupons && params.user.coupons.length !== 0 ) {
        Cache[params.user._id] = Cache[params.user._id] || {};
        Cache[params.user._id].coupon_map = _.reduce(params.user.coupons, function(memo, item) {
          _.each(item.outlets, function(outlet) {
            memo[outlet] = memo[outlet] || {};
            memo[outlet].coupons = memo[outlet].coupons || [];
            if (item.status === "active") {
              memo[outlet].coupons.push(item);
            }
          });
          return memo;
        }, {});
      }
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
    var cmap =  Cache[params.user._id] &&
                Cache[params.user._id].checkin_map || null;

    var outlets = params.outlets;
    if (cmap) {
      _.each(cmap, function(value, key) {
        outlets[key].recco = outlets[key].recco || {};
        outlets[key].recco.checkins = value;
      });
      params.outlets = outlets;
      deferred.resolve(params);
    } else {
      deferred.resolve(params);
    }
  } else {
    deferred.resolve(params);
  }
  return deferred.promise;
}

function set_user_coupons(params) {
  var deferred = Q.defer();
  if (params.user) {
    var cmap =  Cache[params.user._id] &&
                Cache[params.user._id].coupon_map || null;

    var outlets = params.outlets;
    if (cmap) {
      _.each(cmap, function(value, key) {
        outlets[key].recco = outlets[key].recco || {};
        outlets[key].recco.coupons = value.coupons.length;
      });
      params.outlets = outlets;
      deferred.resolve(params);
    } else {
      deferred.resolve(params);
    }
  } else {
    deferred.resolve(params);
  }
  return deferred.promise;
}

function set_distance(params) {
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
  var deferred = Q.defer();
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
  var deferred = Q.defer();
  params.outlets = _.mapObject(params.outlets, function(val, key) {
    var relevance = 0;
    val.recco = val.recco || {};

    // USER CHECKIN RELEVANCE
    if (val.recco.checkins) {
      relevance = relevance + val.recco.checkins * 10;
    }
    // USER FOLLOW RELEVANCE
    if (params.user) {
      if (Cache[params.user._id] &&
          Cache[params.user._id].favourite_map &&
          Cache[params.user._id].favourite_map[val._id]) {
        relevance = relevance + 10000;
      }
    }

    // USER COUPON RELEVANCE
    if (val.recco.coupons) {
      relevance = relevance + val.recco.coupons * 1000;
    }

    // OUTLET DISTANCE RELEVANCE
    if (val.recco.distance) {
      relevance = relevance + val.recco.distance;
    }

    // OUTLET OPEN RELEVANCE
    if (!val.recco.closed) {
      relevance = relevance + 100;
    }

    // OUTLET REDEEMED RELEVANCE
    if (val.analytics &&
        val.analytics.coupon_analytics &&
        val.analytics.coupon_analytics.coupons_redeemed) {
      relevance = relevance + val.analytics.coupon_analytics.coupons_redeemed * 10;
    }

    // OUTLET GENERATED RELEVANCE
    if (val.analytics &&
        val.analytics.coupon_analytics &&
        val.analytics.coupon_analytics.coupons_generated) {
      relevance = relevance + val.analytics.coupon_analytics.coupons_generated;
    }

    // CURRENT OFFERS RELEVANCE
    if (val.offers && val.offers.length > 1) {
      relevance = relevance + val.offers.length * 1000;
    }

    val.recco = val.recco || {};
    val.recco.relevance = relevance;
    return val;
  });
  deferred.resolve(params);
  return deferred.promise;
}

function sort_by_relevance(params) {
  var deferred = Q.defer();
  params.outlets = _.sortBy(params.outlets, function(item) {
    return -item.recco.relevance;
  });

  deferred.resolve(params);
  return deferred.promise;
}

function pick_outlet_fields(params) {
  var deferred = Q.defer();
  params.outlets = _.map(params.outlets, function(item) {
    var massaged_item = {};
    massaged_item._id = item._id;
    massaged_item.name = item.basics.name;
    massaged_item.city = item.contact.location.city;
    massaged_item.address = item.contact.location.address;
    massaged_item.locality_1 = item.contact.location.locality_1[0];
    massaged_item.locality_2 = item.contact.location.locality_2[0];
    massaged_item.distance = item.recco.distance || null;
    massaged_item.open = !item.recco.closed;
    massaged_item.phone = item.contact.phones.mobile[0] && item.contact.phones.mobile[0].num;
    massaged_item.offers = item.offers;
    if (params.user) {
      if (Cache[params.user._id] &&
          Cache[params.user._id].favourite_map &&
          Cache[params.user._id].favourite_map[item._id]) {
        massaged_item.following = true;
      } else {
        massaged_item.following = false;
      }
    }
    if (item.photos && item.photos.logo) {
      massaged_item.logo = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + item._id + '/'+ item.photos.logo;
    }
    if (item.photos && item.photos.background) {
      massaged_item.background = 'https://s3-us-west-2.amazonaws.com/twyst-outlets/' + item._id + '/'+ item.photos.background;
    }
    massaged_item.open_next = RecoHelper.opensAt(item.business_hours);
    return massaged_item;
  });

  deferred.resolve(params);
  return deferred.promise;
}

function massage_offers(params) {
  var deferred = Q.defer();

  params.outlets = _.map(params.outlets, function(item) {
    item = add_user_coupons(
                pick_offer_fields(
                      select_relevant_checkin_offer(item)));
    return item;
  });

  deferred.resolve(params);
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

    // AND THEN PICK THE FIRST ONE
    item.offers = _.filter(item.offers, function(offer) {
      if (offer.offer_type === 'checkin') {
        if (checkins < offer.rule.event_count && !returned) {
          returned = true;
          return true;
        } else {
          return false;
        }
      } else {
        if (offer.offer_type === 'winback' || offer.offer_type === 'birthday') {
          return false;
        } else {
          return true;
        }
      }
    });

    return item;
  }

  function add_user_coupons(item) {
    if (params.user && params.user.coupons.length !== 0) {
      var coupon_map = Cache[params.user._id].coupon_map[item._id] &&
                        Cache[params.user._id].coupon_map[item._id].coupons || null;

      if (item.offers && item.offers.length !== 0 && coupon_map !== null) {
        coupon_map = _.map(coupon_map, function(item) {
          var coupon = {};
          coupon.type = "coupon";
          coupon.status = item.status;
          coupon.title = item.title;
          coupon.terms = item.detail;
          coupon.expiry = item.expiry;
          return coupon;
        });

        item.offers = item.offers.concat(coupon_map);
      }
      return item;
    } else {
      return item;
    }
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
          massaged_offer.available_now = RecoHelper.isClosed(offer.actions.reward.reward_hours);
          massaged_offer.available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
        }
        // massaged_offer.applicability = offer.actions.reward.applicability;
        massaged_offer.valid_days = offer.actions.reward.valid_days;
        return massaged_offer;
      }

    });
    return item;
  }
}

function paginate(params) {
  var deferred = Q.defer();
  var start = params.query.start || 1;
  var end = params.query.end || undefined;
  var outlets = params.outlets.slice(start - 1, end);
  deferred.resolve(outlets);
  return deferred.promise;
}
//TODO: Cache the recco set for pagination.
module.exports.get = function(req, res) {
  get_outlets(req.query)
  .then(function(data){
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
    HttpHelper.success(res, data, "Got the recos");
  })
  .fail(function(err) {
    HttpHelper.error(res, err || false, "Error getting reccos");
  });
};
