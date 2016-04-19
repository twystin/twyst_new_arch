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
  var notify_text = 'Order has not been accepted yet at outlet  '+ what.outlet.name + ' order number '+ what.order_number;
  var payload = {
    from: 'TWYSTR',
  	phone: who,
  	message: notify_text
  };

  var faye_payload = {
    message: notify_text,
    order_id: what.order_id,
    type: 'not_accepted'
  }
  Transporter.send('faye', 'faye', {
    path: 'console',
    message: faye_payload
  });

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
