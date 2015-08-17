var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  deferred.resolve(passed_data);
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  deferred.resolve(passed_data);
  return deferred.promise;
}