'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');

module.exports.get = function(req, res) {
  Outlet.find({}, function(err, outlets) {
    if (err || outlets.length === 0) {
      HttpHelper.error(res, err || true, "Couldn't get outlets");
    } else {
      HttpHelper.success(res, massage(outlets, req.query), "Found outlets");
    }
  });

  function massage(data, query) {
    var start = query.start || 1;
    var end = query.end || undefined;
    var lat = query.lat || 23;
    var long = query.long || 75;
    var q = query.q || null;
    var token = query.token || null;

    if (end < start) {
      return [];
    }

    massaged_data = _.map(data, pick);

    function pick(item) {
      var massaged_item = {};
      massaged_item.name = item.basics.name;
      massaged_item.city = item.contact.location.city;
      massaged_item.address = item.contact.location.address;
      massaged_item.distance = 'TBD';
      massaged_item.phone = item.contact.phones.mobile[0] && item.contact.phones.mobile[0].num;
      massaged_item.open = 'TBD';
      massaged_item.thumbnail = item.photos.others[0] && item.photos.others[0].image._th;
      massaged_item.offers = 'TBD';
      // console.log(massaged_item);
      return massaged_item;
    }

    var massaged_data = massaged_data.slice(start - 1, end);

    return massaged_data;
  }
};
