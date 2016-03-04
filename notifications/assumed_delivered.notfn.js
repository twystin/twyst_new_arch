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
  
  var date = new Date();
  var time = date.getTime();
  var user_payload = {};
  user_payload.head = 'Order Received';
  user_payload.body = 'We want to know if your order has been delivered.';
  user_payload.state = 'ASSUMED_DELIVERED';
  user_payload.time = time;
  user_payload.order_id = what.order_id;
  user_payload.gcms = who;

  if (when) {
    Transporter.schedule("push", "gcm", when, user_payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    })
  } else {
    Transporter.send("push", "gcm", user_payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    });
  }

  return deferred.promise;
}
