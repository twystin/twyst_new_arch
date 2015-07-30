var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var outlet = _.get(passed_data, 'event_data.event_meta.outlet');
  var location = _.get(passed_data, 'event_data.event_meta.location');

  if (!offer || !outlet || !location) {
    deferred.reject('Submit offer information needs to have offer, outlet & location.');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  var deferred = Q.defer();
  deferred.resolve(true);
  return deferred.promise;
};
