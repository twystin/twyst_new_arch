var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var RecoHelper = require('../helpers/reco.hlpr.js');
var Outlet = mongoose.model('Outlet');


module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  var type = _.get(passed_data, 'event_data.event_meta.type');
  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var outlet = _.get(passed_data, 'event_data.event_outlet');
  
  if (!type || !offer) {
    deferred.reject('Use deal needs type and offer.');
  } else {
    deferred.resolve(passed_data);
  }
  deferred.resolve(passed_data);
  return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var offer = _.get(passed_data, 'event_data.event_meta.offer');
    var outlet = _.get(passed_data, 'event_data.event_outlet'); 
    Outlet.findOne({_id: outlet }, function(err, outlet){
        if(err || !outlet) {
            console.log('oaksdfoijsgio')
            deferred.reject('Could not find outlet to redeem coupon');
        }
        else if(isOutletClosed(outlet)) {            
            deferred.reject('Outlet is currently closed')
        }
        else{
            deferred.resolve(passed_data);
        }
    })
    return deferred.promise;
}

function isOutletClosed(outlet) {
    if (outlet && outlet.business_hours ) {
        if(RecoHelper.isClosed('dummy', 'dummy', outlet.business_hours)) {
            return true;
        }
    }
    else{
      return false;
    }
}