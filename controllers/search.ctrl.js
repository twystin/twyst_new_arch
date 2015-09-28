'use strict';
/*jslint node: true */


var _ = require('underscore');
var mongoose = require('mongoose');
var Q = require('q');
var logger = require('tracer').colorConsole();
var Event = mongoose.model('Event');
var HttpHelper = require('../common/http.hlpr.js');
var RecoHelper = require('./helpers/reco.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var Cache = require('../common/cache.hlpr.js');
var Outlet = mongoose.model('Outlet');

function get_outlets(params) {
    logger.log();
    var deferred = Q.defer();
    Outlet.search(params.text,  {}, function(err, data) {
        if(err || data.results.length === 0){
            deferred.reject(new Error('Could not get outlets'));
        }
        else{
            var reduced_outlets = _.reduce(data.results, function(memo, item) {
                item = item.toJSON();
                memo[item._id] = item;
                return memo;
            }, {});
            
            deferred.resolve({
                query: params,
                outlets:  reduced_outlets 
            });
            
        }
    })
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
            outlets[key].recco = outlets[key].recco || {};
            outlets[key].recco.checkins = value;
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
  params.outlets = _.mapObject(params.outlets, function(val, key) {
    var relevance = 0;
    val.recco = val.recco || {};

    // USER CHECKIN RELEVANCE
    if (val.recco.checkins) {
      relevance = relevance + val.recco.checkins * 10;
    }
    // USER FOLLOW RELEVANCE
    if (params.user) {
      Cache.hget(params.user._id, 'favourite_map', function(err, reply) {
        if (reply) {
          var fmap = JSON.parse(reply);
          if (fmap && fmap[val._id]) {
            relevance = relevance + 10000;
          }
        }
      });
    }

    // USER COUPON RELEVANCE
    if (val.recco.coupons) {
      relevance = relevance + val.recco.coupons * 1000;
    }

    // OUTLET DISTANCE RELEVANCE
    if (val.recco.distance) {
      relevance = relevance - (val.recco.distance * 1500);
    }

    // OUTLET OPEN RELEVANCE
    if (!val.recco.closed) {
      relevance = relevance + 100;
    }

    // OUTLET REDEEMED RELEVANCE
    //if (val.analytics &&
     // val.analytics.coupon_analytics &&
     // val.analytics.coupon_analytics.coupons_redeemed) {
    //  relevance = relevance + val.analytics.coupon_analytics.coupons_redeemed * 10;
    //}

    // SHOULD FIX THIS LATER
    //if (val.basics && val.basics.featured) {
    //  relevance = relevance + 1000000;
   // }

    // OUTLET GENERATED RELEVANCE
    //if (val.analytics &&
    //  val.analytics.coupon_analytics &&
    //  val.analytics.coupon_analytics.coupons_generated) {
    //  relevance = relevance + val.analytics.coupon_analytics.coupons_generated;
    //}

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
      massaged_item.distance = item.recco.distance || null;
      massaged_item.open = !item.recco.closed;
      massaged_item.phone = item.contact.phones.mobile[0] && item.contact.phones.mobile[0].num;
      massaged_item.offers = item.offers;
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
      
      return massaged_item;
    });
    params.outlets = _.compact(params.outlets);

    deferred.resolve(params);
  });

  return deferred.promise;
}

function massage_offers(params) {
  logger.log();

  var deferred = Q.defer();
  var coupon_map = null;
  if (params.user) {
    Cache.hget(params.user._id, 'coupon_map', function(err, reply) {
      if (err || !reply) {
        coupon_map = null;
      } else {
        coupon_map = JSON.parse(reply);
      }

      params.outlets = _.map(params.outlets, function(item) {
        item = add_user_coupons(
          pick_offer_fields(
            select_relevant_checkin_offer(item), params.user._id, params.query.date, params.query.time), coupon_map && coupon_map[item._id] && coupon_map[item._id].coupons);
        item.offers = _.sortBy(item.offers, function(offer) {
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
        return item;
      });
      deferred.resolve(params);

    });
  } else {
    params.outlets = _.map(params.outlets, function(item) {
      item = pick_offer_fields(select_relevant_checkin_offer(item), params.user._id, params.query.date, params.query.time);
      return item;
    });
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
        if (coupon.lapse_date <= new Date()) {
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

function paginate(params) {
  logger.log();

  var deferred = Q.defer();
  var start = params.query.start || 1;
  var end = params.query.end || undefined;
  params.outlets = params.outlets.slice(start - 1, end);
  deferred.resolve(params);
  return deferred.promise;
}

module.exports.search = function(req, res) {
    var token = req.query.token || null;
    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    }

    Outlet.setKeywords(function(err) {
        if(err) {
            HttpHelper.error(res, null, "error in saving keywords");
        }
    });

    get_outlets(req.query)
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
      HttpHelper.success(res, data, "Got results");
    })
    .fail(function(err) {
        console.log(err)
        HttpHelper.error(res, err || false, "Error in search");
    });
    
  
};


