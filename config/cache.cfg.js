'use strict';
/*jslint node: true */

var Cache = require('../common/cache.hlpr');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var LocationHandler = require('./locations.cfg.js');
var BucksHandler = require('./twyst_bucks.cfg.js');

var _ = require('lodash');
var logger = require('tracer').colorConsole();

function populateOutlets() {
  Outlet.find({}).lean().exec(function(err, outlets) {
    if (err || outlets.length === 0) {
      logger.error("Error populating cache");
    } else {
      var reduced_outlets = _.reduce(outlets, function(memo, item) {
        memo[item._id] = item;
        return memo;
      }, {});
      Cache.set('outlets', JSON.stringify(reduced_outlets), function(err) {
        if (!err) {
          logger.info('Populated cache with outlets');
        }
      });
    }
  });
}

function populateLocations() {
  Cache.hset('locations', 'location_map', JSON.stringify(LocationHandler.locations), function(err) {
    if (!err) {
      logger.info('Populated cache with locations');
    }
  });
}

function populateTwystBucks() {
  Cache.hset('twyst_bucks', 'twyst_bucks_grid', JSON.stringify(BucksHandler.bucks_grid), function(err) {
    if (!err) {
      logger.info('Populated cache with twyst_bucks');
    }
  });
}

module.exports.populate = function() {
  logger.info('Trying to populate the cache');
  populateOutlets();
  populateLocations();
  populateTwystBucks();
};
