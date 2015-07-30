var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var bill_date = _.get(passed_data, 'event_data.event_meta.bill_date');
  var photo = _.get(passed_data, 'event_data.event_meta.photo');
  var outlet = _.get(passed_data, 'event_data.event_outlet');

  if (!bill_date || !photo || !outlet) {
    deferred.reject('Submit bill needs to have bill date, photo & outlet.');
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
