'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var gcm = require('node-gcm');
var fs = require('fs');

module.exports.send = function(payload) {
  logger.log();
  var deferred = Q.defer();

  // MOVE THE SERVER KEY TO SETTINGS
  var server_key = "AIzaSyAsC2wnD51Lx_q-SIb2OS9f4sBam0EJrrM"; // TO FIX
  var sender = new gcm.Sender(server_key);
  var message = new gcm.Message();
  message.addData('message', payload.body);
  message.addData('title', payload.head);
  message.addData('msgcnt', '1'); 
  message.addData('soundname', 'beep.wav'); 
  message.timeToLive = 10000; 

  var registrationIds = [];
  registrationIds = registrationIds.concat(payload.gcms);

  logger.log(message);
  sender.send(message, registrationIds, 4, function(result) {
    deferred.resolve(result);
  });


  return deferred.promise;
}
