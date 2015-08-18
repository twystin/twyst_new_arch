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
  var notify_text = "You have " + what.count + " unused vouchers on Twyst. Redeem them now!";
  var payload = {
  	body: notify_text,
  	head: 'Unused vouchers',
  	gcms: who
  };

  if (when) {
    transporter.schedule("push", "gcm", when, payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    })
  } else {
    transporter.send("push", "gcm", payload).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    });
  }

  return deferred.promise;

}
