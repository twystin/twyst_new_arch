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
      deferred.resolve(params);
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

    if (val.recco.checkins) {
      relevance = relevance + val.recco.checkins * 10;
    }

    if (val.recco.distance) {
      relevance = relevance + val.recco.distance;
    }

    if (!val.recco.closed) {
      relevance = relevance + 100;
    }

    if (val.analytics &&
        val.analytics.coupon_analytics &&
        val.analytics.coupon_analytics.coupons_redeemed) {
      relevance = val.analytics.coupon_analytics.coupons_redeemed * 10;
    }

    if (val.analytics &&
        val.analytics.coupon_analytics &&
        val.analytics.coupon_analytics.coupons_generated) {
      relevance = val.analytics.coupon_analytics.coupons_generated;
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
  deferred.resolve(params);
  return deferred.promise;
}

function pick_offer_fields(params) {
  var deferred = Q.defer();
  deferred.resolve(params);
  return deferred.promise;
}

function add_user_coupons(params) {
  var deferred = Q.defer();
  deferred.resolve(params);
  return deferred.promise;
}

function paginate(params) {
  var deferred = Q.defer();
  var start = params.query.start || 1;
  var end = params.query.end || undefined;
  var outlets = params.outlets.slice(start - 1, end);
  deferred.resolve(outlets);
  return deferred.promise;
}

module.exports.get = function(req, res) {
  get_outlets(req.query)
  .then(function(data){
    return get_user(data);
  })
  .then(function(data) {
    return set_user_checkins(data);
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
    return pick_offer_fields(data);
  })
  .then(function(data) {
    return add_user_coupons(data);
  })
  .then(function(data) {
    return paginate(data);
  })
  .then(function(data) {
    HttpHelper.success(res, data, "Got the recos");
  })
  .fail(function(err) {
    console.log(err);
  });
};
