'use strict';
/*jslint node: true */

var Cache = require('../common/cache.hlpr');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
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

function populateCheckinMap() {
  Event.aggregate({
    $group: {
        _id: {
            user: "$event_user",
            outlet: "$event_outlet"
        },
        count: {
            $sum: 1
        }
    }
  }).exec(function(err, map) {
      var user_map = {};
      _.each(map, function(obj) {
          if (!user_map[obj._id.user]) {
              user_map[obj._id.user] = {};
          }
          if (!user_map[obj._id.user][obj._id.outlet]) {
              user_map[obj._id.user][obj._id.outlet] = obj.count;
          }
      });
      _.each(Object.keys(user_map), function(user_id) {
          Cache.hset(user_id, 'checkin_map', JSON.stringify(user_map[user_id]));
      });
  });
}

module.exports.populate = function() {
  logger.info('Trying to populate the cache');
  populateOutlets();
  populateLocations();
  populateTwystBucks();
  populateCheckinMap();
};
