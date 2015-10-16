'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr.js');
var Cache = require('../common/cache.hlpr.js');

module.exports.get_locations = function(req, res) {
  Cache.hget('locations', "location_map", function(err, reply) {
    if (err || !reply) {
      HttpHelper.error(res, err, 'Couldn\'t find locations');
    } else {
      HttpHelper.success(res, JSON.parse(reply), 'Returning locations');
    }
  });
};

module.exports.get_outlet_locations = function(req, res) {
  Cache.get('outlets_location', function(err, reply) {
    if (err || !reply) {
      HttpHelper.error(res, err, 'Couldn\'t find locations');
    } else {
      HttpHelper.success(res, JSON.parse(reply), 'Returning outlets with locations');
    }
  });
};
