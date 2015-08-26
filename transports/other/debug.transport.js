'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.send = function(payload) {
  logger.log();
  var deferred = Q.defer();
  logger.log(payload);
  deferred.resolve('done');
  return deferred.promise;
}
