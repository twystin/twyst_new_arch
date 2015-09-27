'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var Transporter = require('../transports/transporter');

// THIS CAN GET CALLED FROM JOBS OR FROM CODE
module.exports.notify = function(what, when, who, campaign) {
  logger.log();

  var deferred = Q.defer();
  var notify_text = "You have a new voucher in your social pool";
  var payload = {
  	body: notify_text,
  	head: 'New Voucher in Social Pool',
    gcms: who
  };

  if (when) {
    Transporter.schedule("push", "gcm", when, payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    })
  } else {
    Transporter.send("push", "gcm", payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    });
  }

  return deferred.promise;

}
