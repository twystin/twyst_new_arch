'use strict';
/*jslint node: true */

var Cache = require('../common/cache.hlpr');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var Outlet = mongoose.model('Outlet');
var Optout = require('../models/optout.mdl');
var LocationHandler = require('./locations.cfg.js');
var TwystCashHandler = require('./twyst_cash.cfg.js');

var _ = require('lodash');
var logger = require('tracer').colorConsole();

function populateOutlets() {
  Outlet.find({}).exec(function(err, outlets) {
    if (err || outlets.length === 0) {
      logger.error("Error populating cache");
    } else {
      var reduced_outlets = _.reduce(outlets, function(memo, item) {
        item = item.toJSON();
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
};

function populateOutletsLocations() {
  Outlet.find({}).lean().exec(function(err, outlets) {
    if (err || outlets.length === 0) {
      logger.error("Error populating cache");
    } else {
      var active_outlets = _.filter(outlets, function(outlet) {
        return outlet.outlet_meta.status === 'active';
      });
      var reduced_outlets = _.reduce(active_outlets, function(memo, item) {
        var obj = {};
        obj.name = item.basics.name;

        obj.address = item.contact.location.address;
        memo[item._id] = obj;
        return memo;
      }, {});
      Cache.set('outlets_location', JSON.stringify(reduced_outlets), function(err) {
        if (!err) {
          logger.info('Populated cache with outlets locations');
        }
      });
    }
  });
};

function populateLocations() {
  Cache.hset('locations', 'location_map', JSON.stringify(LocationHandler.locations), function(err) {
    if (!err) {
      logger.info('Populated cache with locations');
    }
  });
};

function populateTwystCash() {
  Cache.hset('twyst_cash', 'twyst_cash_grid', JSON.stringify(TwystCashHandler.twyst_cash_grid), function(err) {
    if (!err) {
      logger.info('Populated cache with twyst_cash');
    }
  });
};

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
};

function populateOptouts() {
  Optout.find({}).exec(function(err, optouts) {
    if (err || optouts.length === 0) {
      logger.error("Error populating cache");
    } else {
      Cache.set('optout_users', JSON.stringify(optouts), function(err){
        if(!err){
          logger.info("Opt-out user list loaded.");
        }
      });
    }
  });
};

module.exports.populate = function() {
  logger.info('Trying to populate the cache');
  populateOutlets();
  populateLocations();
  populateTwystCash();
  populateOutletsLocations();
  populateOptouts();
  // populateCheckinMap();
};
