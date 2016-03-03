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
  var payload = {};
  payload.header = 'Order Rejected';
  payload.message = 'Your order has been Rejected by merchant.';
  payload.state = 'REJECTED';
  payload.time = time;
  payload.order_id = data.order_id;

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
