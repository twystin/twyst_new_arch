var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var comments = _.get(passed_data, 'event_data.event_meta.comments');
    
  if (!comments) {
    deferred.reject('Write to twyst needs comments.');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();
  data.event_data.event_meta.status = 'submitted';
  data.event_data.event_meta.phone = data.user.phone;
  data.event_data.event_meta.email = data.user.email;

  deferred.resolve(true);
  return deferred.promise;
};
