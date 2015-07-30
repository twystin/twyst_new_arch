var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();

  // THINGS TO CHECK
  // Is the QR valid?
  // Has this user already checked-in in the last 3 hours?
  // Has this user already checked-in here today?
  // Other checks?

  var deferred = Q.defer();
  var passed_data = data;

  if (!_.get(passed_data, 'event_data.event_outlet')) {
    deferred.reject('Checkin requires an outlet to be passed');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  // UNLOCK VOUCHER 

  var deferred = Q.defer();
  deferred.resolve(true);
  return deferred.promise;
};
