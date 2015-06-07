'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');
var RecoHelper = require('./helpers/reco.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var Cache = require('../common/cache.hlpr.js');
var _ = require('underscore');

module.exports.get = function(req, res) {
  var token = req.query.token;

  if (!Cache.outlets) {
    Outlet.find({}, function(err, outlets) {
      if (err || outlets.length === 0) {
        HttpHelper.error(res, err || true, "Couldn't get outlets");
      } else {
        Cache.outlets = outlets;
        if (token === null) {
          HttpHelper.success(res, massage(Cache.outlets, req.query), "Found outlets");
        } else {
          AuthHelper.get_user(token).then(function(data) {
            HttpHelper.success(res, massage(Cache.outlets, req.query, data.data), "Found outlets");
          }, function(err) {
            HttpHelper.success(res, massage(outlets, req.query), "Found outlets");
          });
        }
      }
    });
  } else {
    HttpHelper.success(res, massage(Cache.outlets, req.query), "Found outlets");
  }


  function massage(data, query, user) {
    var start = query.start || 1;
    var end = query.end || undefined;
    var lat = query.lat || 28.46;
    var long = query.long || 77.06;
    var q = query.q || null;

    var massaged_data = [];

    if (end < start) {
      return [];
    }


    massaged_data = _.map(data, pick);

    function pick(item) {
      var massaged_item = {};
      massaged_item._id = item._id;
      massaged_item.name = item.basics.name;
      massaged_item.city = item.contact.location.city;
      massaged_item.address = item.contact.location.address;
      massaged_item.distance = distance(lat, long, item.contact.location.coords.latitude, item.contact.location.coords.longitude, 'K');
      massaged_item.phone = item.contact.phones.mobile[0] && item.contact.phones.mobile[0].num;
      massaged_item.open = RecoHelper.isClosed(item.business_hours);
      massaged_item.thumbnail = item.photos.others[0] && item.photos.others[0].image._th;
      massaged_item.offers = _.map(item.offers, filter_offer);
      massaged_item.redeemed = item.analytics &&
                               item.analytics.coupon_analytics &&
                               item.analytics.coupon_analytics.coupons_redeemed || 0;
      function filter_offer(offer) {
        var massaged_offer = {};
        massaged_offer.type = offer.offer_type;
        massaged_offer.title = offer.actions.reward.title;
        massaged_offer.terms = offer.actions.reward.terms;
        massaged_offer.expiry = offer.actions.reward.expiry;
        massaged_offer.detail = offer.actions.reward.detail;
        massaged_offer.meta = offer.actions.reward.reward_meta;
        return massaged_offer;
      }

      return massaged_item;
    }

    massaged_data = _.sortBy(massaged_data, function(item) {
      return -item.redeemed;
    });
    massaged_data = massaged_data.slice(start - 1, end);

    function couponify(data) {
      if (user && user.coupons) {
        _.each(data, function(outlet) {
          _.each(user.coupons, function(coupon) {
            _.each(coupon.outlets, function(coupon_outlet) {
              if (coupon_outlet + "" == outlet._id + "") {
                var massaged_offer = {};
                massaged_offer.type = 'coupon';
                massaged_offer.title = coupon.title;
                massaged_offer.expiry = coupon.expiry;
                massaged_offer.detail = coupon.detail;
                massaged_offer.meta = {
                  used_details : coupon.used_details,
                  code : coupon.code,
                  issued_at: coupon.issued_at
                };
                outlet.offers[outlet.offers.length] = massaged_offer;
              }
            });
          });
        });
      }

      return data;
    }

    return couponify(massaged_data);
  }
};



function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit === 'K') {
    dist = dist * 1.609344;
  }
	if (unit === 'N') {
    dist = dist * 0.8684;
  }

	return dist.toFixed(2);
}
