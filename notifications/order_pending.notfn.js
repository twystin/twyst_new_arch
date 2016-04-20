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
    message: {
      message: notify_text,
      order_id: what.order_id,
      type: 'not_accepted'
    },
    path: 'console'
  }

  var Bayeux = require('./app_server');
  var send_notif = Bayeux.bayeux.getClient().publish('/'+faye_payload.path, faye_payload.message, {attempts: 7});
  send_notif.then(function() {
    console.log('notif deliverd to '+  faye_payload.path); 
  }, function(error) {
    console.log('error in sending notif to ' + faye_payload.path);
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
