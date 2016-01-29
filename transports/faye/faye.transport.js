'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Bayeux = require('../../app_server');

module.exports.send = function(payload) {
  logger.log();
  var deferred = Q.defer();

  var send_notif = Bayeux.bayeux.getClient().publish('/'+payload.path, payload.message, {attempts: 7});
  send_notif.then(function() {
    console.log('notif deliverd to '+  payload.path);
    deferred.resolve();
  }, function(error) {
    deferred.reject();
    console.log('error in sending notif to ' + payload.path);
  });
  return deferred.promise;
}
