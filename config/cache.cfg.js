'use strict';
/*jslint node: true */

var Cache = require('../common/cache.hlpr');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var LocationHandler = require('../scripts/location.js');

var _ = require('underscore');

function populateOutlets() {
  Outlet.find({}).lean().exec(function (err, outlets) {
    if (err || outlets.length === 0) {
      console.log("Error populating cache");
    } else {
      var reduced_outlets = _.reduce(outlets, function (memo, item) {
        memo[item._id] = item;
        return memo;
      }, {});
      Cache.set('outlets', JSON.stringify(reduced_outlets));
      console.log("Populated the cache");
    }
  });
}

function populateLocations() {
  Cache.hset('locations', 'location_map', JSON.stringify(LocationHandler.locations));


}

module.exports.populate = function() {
  populateOutlets();
  populateLocations();
};
