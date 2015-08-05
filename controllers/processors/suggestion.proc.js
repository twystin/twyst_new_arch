var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var outlet = _.has(passed_data, 'event_data.event_meta.outlet');
  var location = _.has(passed_data, 'event_data.event_meta.location');

  if (!outlet || !location) {
    deferred.reject('Suggestion needs to have outlet & location.');
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
