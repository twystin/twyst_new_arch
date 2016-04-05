'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var RecoHelper = require('./reco.hlpr.js');
var moment = require('moment');
var Banner = mongoose.model('Banner');
var User = mongoose.model('User');
var OutletCtrl = require('../outlet.ctrl');
var geolib = require('geolib');

module.exports.create_banner = function(token, new_banner) {
    logger.log();
    var deferred = Q.defer();

    var banner = {};
    banner = _.extend(banner, new_banner);

    AuthHelper.get_user(token).then(function(data) {
        banner = new Banner(banner);

        banner.save(function(err, banner) {
            if (err) {
                console.log(err);
                deferred.reject({
                    err: err || false,
                    message: 'Couldn\'t create banner'
                });
            } else {
                deferred.resolve({
                    data: banner,
                    message: 'Banner created successfully'
                });
            }
        });
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });

    return deferred.promise;
}

module.exports.get_banner = function(token, bannerId) {
    logger.log();
    var deferred = Q.defer();

    Banner.findById(bannerId)
        .exec(function(err, banners) {
            if (err || !banners) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load banner details'
                })
            } else {
               
                deferred.resolve({
                    data: banners,
                    message: 'banner found'
                });
            }
        })
    return deferred.promise;
}

module.exports.get_outlet_banner = function(req, bannerId) {
    logger.log();
    var deferred = Q.defer();
    console.log(req.query);
    Banner.findById(bannerId)
        .exec(function(err, banner) {
            if (err || !banner) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load banner details'
                })
            } else {
                console.log(banner.outlets);
                Outlet.find({_id: {$in: banner.outlets}}).exec(function(err, outlets) {
                    if (err || !outlets) {
                        deferred.reject({
                            err: err,
                            message: 'Unable to load banner details'
                        })
                    } else {
                        var offer_outlets = [];
                        
                        get_outlets(req.query, outlets)
                        .then(function(data) {
                          return get_user(data);
                        })
                        .then(function(data) {
                          return set_open_closed(data);
                        })
                        .then(function(data) {
                          return set_delivery_experience(data);
                        })
                        .then(function(data) {
                          return map_valid_delivery_zone(data);
                        })
                        .then(function(data) {
                          return set_cashback(data);
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
                            var twyst_cash = data.twyst_cash;
                            var data = {};
                            data.outlets = outlets;
                            data.twyst_cash = twyst_cash;
                            deferred.resolve({
                                data: data,
                                message: 'banner found'
                            });
                        })
                        .fail(function(err) {
                            deferred.reject({
                                err: err,
                                message: 'error in getting banner detail'
                            }); 
                        });                                                                
                    }
                })
                
            }
        })
    return deferred.promise;
}

module.exports.update_banner = function(token, updated_banner) {
    logger.log();
    var deferred = Q.defer();

    Banner.findById(updated_banner._id)
        .exec(function(err, banner) {
            if (err || !banner) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to update banner'
                });
            } else {
                console.log(updated_banner)
                banner = _.extend(banner, updated_banner);
                banner.save(function(err) {
                    if (err) {
                        console.log(err)
                        deferred.reject({
                            err: err || true,
                            message: 'Failed to update banner'
                        });
                    } else {
                        deferred.resolve({
                            data: banner,
                            message: "Banner updated successfully"
                        });
                    }
                });
            }
        });
    return deferred.promise;
}

module.exports.delete_banner = function(token, bannerId) {
    logger.log();
    var deferred = Q.defer();

    Banner.findOneAndRemove({
            _id: bannerId
        })
        .exec(function(err) {
            if (err) {
                deferred.reject({
                    data: err || true,
                    message: 'Unable to delete the banner right now'
                });
            } else {
                deferred.resolve({
                    data: {},
                    message: 'Deleted banner successfully'
                });
            }
        });
    return deferred.promise;
}


module.exports.get_all_banners = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        
        Banner.find({}).exec(function(err, banners) {
            if (err || !banners) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to load banners'
                });
            } 
            else{
                
                deferred.resolve({
                    data: banners,
                    message: 'Banners loaded successfully'
                });   
            }
        });
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });
    return deferred.promise;
}

function get_outlets(params, outlets) {
  logger.log();

  var deferred = Q.defer();
  Cache.get('outlets', function(err, reply) {
    if (err) {
      deferred.reject('Could not get outlets');
    } else {
        var offer_outlets = [];
        var cached_outlets = JSON.parse(reply);
        _.each(outlets, function(outlet){
            if (cached_outlets[outlet._id]) {
            console.log('here');
            offer_outlets.push(cached_outlets[outlet._id]);
           
          }
        })
        deferred.resolve({
            query: params,
            outlets: offer_outlets
        });
    }
  });

  return deferred.promise;
}

function get_user(params) {
  logger.log();
  console.log(params.query.token);
  var deferred = Q.defer();
  if (params.query.token) {
    AuthHelper.get_user(params.query.token).then(function(data) {
      params.user = data.data;
      params.twyst_cash = data.data.twyst_cash;
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


function set_open_closed(params) {
  logger.log();

  var deferred = Q.defer();
  params.outlets = _.compact(params.outlets);
  console.log(params.outlets)
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
            val.delivery_zone = val.attributes.delivery.delivery_zone[0];
          }  
        }
        else{
          val.delivery_zone = val.attributes.delivery.delivery_zone[0];
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

function set_delivery_experience(params) {
  logger.log();
  var deferred = Q.defer();
  
  params.outlets = _.mapObject(params.outlets, function(val, key) {
    val.recco = val.recco || {};
    if(val.twyst_meta.rating && val.twyst_meta.rating.value){
      val.recco.delivery_experience = val.twyst_meta.rating.value.toFixed(1);  
    }
    else{
      val.recco.delivery_experience = null;    
    }
    
    return val;
  });
  
  deferred.resolve(params);
  return deferred.promise;
}

function set_cashback(params) {
    logger.log();
    var deferred = Q.defer();
    params.outlets = _.compact(params.outlets);  
    params.outlets = _.map(params.outlets, function(val) {
    
        if(val.twyst_meta.cashback_info && val.twyst_meta.cashback_info.base_cashback) {
            var cod_cashback = 0, inapp_cashback = 0, order_amount_cashback = 0;
            var base_cashback = val.twyst_meta.cashback_info.base_cashback;
            if(val.twyst_meta.cashback_info.order_amount_slab.length) {
                order_amount_cashback = _.find(val.twyst_meta.cashback_info.order_amount_slab, function(slab){                    
                    if(slab.start && !slab.end) {
                        return slab.ratio*base_cashback;
                    }
                });  
            }
               
            inapp_cashback = val.twyst_meta.cashback_info.in_app_ratio *base_cashback;
            cod_cashback = val.twyst_meta.cashback_info.cod_ratio * base_cashback;
            if(order_amount_cashback && order_amount_cashback.ratio) {
              order_amount_cashback = order_amount_cashback.ratio*base_cashback;  
            }
            var cashback = _.max([base_cashback, order_amount_cashback, inapp_cashback, cod_cashback], function(cashback){ return cashback; });
            val.cashback = Math.round(cashback);
        }
        else{
            val.cashback = 0;
        }
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
    relevance = relevance + val.cashback*100;
    relevance = relevance - val.valid_zone.delivery_estimated_time;
    relevance = relevance - val.valid_zone.min_amt_for_delivery;
    relevance = relevance + val.recco.delivery_experience || 0;
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

      if(!item.menus.length || item.menus[0].status != 'active') {
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
      
      if(item.recco.closed) {
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
      massaged_item.delivery_experience = item.recco.delivery_experience || null;
      massaged_item.delivery_time = item.valid_zone.delivery_estimated_time;
      massaged_item.minimum_order = item.valid_zone.min_amt_for_delivery;
      massaged_item.payment_options = item.valid_zone.payment_options;
      massaged_item.delivery_conditions = item.valid_zone.delivery_conditions;
      
      massaged_item.cashback = item.cashback;
     
      massaged_item.delivery_zones = item.delivery_zones;
      var offer_count = 0;
      for(var i=0; i<item.offers.length; i++) {
        if(item.offers[i] && item.offers[i].offer_type === 'offer' 
        && item.offers[i].actions.reward.applicability.delivery
        && item.offers[i].offer_status === 'active' 
        &&(new Date(item.offers[i].offer_end_date)) >= new Date()){
          offer_count = offer_count+1;
        }
      }
      massaged_item.offer_count = offer_count;
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