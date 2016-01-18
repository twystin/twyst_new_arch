'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr.js');
var Cache = require('../common/cache.hlpr.js');
var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var geolib = require('geolib');
var OutletHelper = require('./helpers/outlet.hlpr');

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

module.exports.verify_delivery_location = function(req, res) {
    logger.log();

    var data = {};
    data.outlet = req.body.outlet;
    data.coords = req.body.coords;

    if(req.body.coords && !req.body.coords.lat || !req.body.coords.long || !req.body.outlet) {
        HttpHelper.error(res, 'some parameters missing');
    }

    get_outlet(data)
    .then(function(data){
        return get_delivery_zone(data);
    })
    .then(function(data) {
        console.log(data);
        if(!data.outlet.valid_zone) {
          HttpHelper.error(res, 'outlet does not deliver at selected location');  
        }
        else{
          HttpHelper.success(res, data.outlet.valid_zone, 'Returning valid delivery zone');
        }
    })
    .fail(function(err) {
        console.log(err)
        HttpHelper.error(res, 'Couldn\'t find outlet');  
    });

};


function get_outlet(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;

    OutletHelper.get_outlet(passed_data.outlet).then(function(data) {
      passed_data.outlet = data.data;
      deferred.resolve(passed_data);
    }, function(err) {
        deferred.reject({
            err: err || true,
            message: 'Could not find the outlet for this id - ' + passed_data.outlet
        });
    }); 

    return deferred.promise;   
}

function get_delivery_zone(data) {
    logger.log();
    var deferred = Q.defer();

    if(data.outlet.attributes.delivery.delivery_zone && data.outlet.attributes.delivery.delivery_zone.length) {        
        
        var delivery_zone = _.map(data.outlet.attributes.delivery.delivery_zone, function(current_zone) {          
          if(current_zone.coord && current_zone.coord.length &&
            geolib.isPointInside({latitude: data.coords.lat, longitude: data.coords.long},
            current_zone.coord)){
            return current_zone;
          }
        })

        delivery_zone = _.compact(delivery_zone);
        delivery_zone =  _.max(delivery_zone, function(zone){ return zone.zone_type});
        if(delivery_zone) {
          data.outlet.valid_zone = delivery_zone;          
          deferred.resolve(data);
        }
        else{
            deferred.reject({
                err: true, 
                message: 'outlet does not deliver in selected deliver zone'
            })
        }    
    }
    else{
        console.log('no delivers zone set up for outlet');
        deferred.reject({
            err: true, 
            message: 'no delivers zone set up for selected outlet'
        })
    }
    return deferred.promise;
}