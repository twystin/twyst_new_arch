'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

module.exports.send = function(transport, which, payload) {
  logger.log('./' + transport + '/' + which + '.transport');
  var deferred = Q.defer();

  var transport = require('./' + transport + '/' + which + '.transport');
  transport.send(payload).then(function(data) {
    deferred.resolve(data);
  }, function(err) {
    deferred.reject(err);
  });

  return deferred.promise;

}

module.exports.schedule = function(transport, which, when, message) {

}
