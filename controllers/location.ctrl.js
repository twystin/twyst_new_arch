'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var LocationHandler = require('../scripts/location.js');
var Cache = require('../common/cache.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');

module.exports.get_locations = function(req, res) {
    var token = req.query.token || null;
    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    }
    Cache.hset('locations', 'location_map', JSON.stringify(LocationHandler.locations));    
    AuthHelper.get_user(req.query.token).then(function(data) {        
        Cache.hget('locations', "location_map", function(err, reply) {
            if (err || !reply) {
                HttpHelper.error(res, err, 'Couldn\'t find locations');
            } else {
                
                HttpHelper.success(res, reply, 'Returning locations');
              
            }
        });
    }, function(err) {
        HttpHelper.error(res, err, "Could not find user");
    });
};

