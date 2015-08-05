var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var bill_date = _.has(passed_data, 'event_data.event_meta.bill_date');
  var photo = _.has(passed_data, 'event_data.event_meta.photo');
  var outlet_name = _.has(passed_data, 'event_data.event_meta.outlet_name');
  var outlet = _.has(passed_data, 'event_data.event_outlet');

  if (!bill_date || !photo || !outlet_name) {
    deferred.reject('Submit bill needs to have bill date, photo & outlet name.');
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
