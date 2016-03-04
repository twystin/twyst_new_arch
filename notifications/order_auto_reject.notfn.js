'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var Transporter = require('../transports/transporter');

// THIS CAN GET CALLED FROM JOBS OR FROM CODE
module.exports.notify_user = function(what, when, who, campaign) {
  logger.log();

  var deferred = Q.defer();

  var date = new Date();
  var time = date.getTime();
  var user_payload = {};
  user_payload.head = 'Order Rejected';
  user_payload.body = 'Your order has been Rejected by merchant.';
  user_payload.state = 'REJECTED';
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

module.exports.notify_merchant = function(what, when, who, campaign) {
  logger.log();

  var deferred = Q.defer();
  var notify_text = 'Order has been Rejected by system '+ what.outlet.name + ' order number '+ what.order_number;
  var payload = {
    from: 'TWYSTR',
    phone: 8130857967,
    message: notify_text
  };

  if (when) {
    Transporter.schedule("sms", "vf", when, payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    })
  } else {
    Transporter.send("sms", "vf", payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    });
  }

  return deferred.promise;

}
