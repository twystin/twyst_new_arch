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
  var server_key = "AIzaSyAsC2wnD51Lx_q-SIb2OS9f4sBam0EJrrM";
  var sender = new gcm.Sender(server_key);
  var message = new gcm.Message();
  message.addData('message', payload.body);
  message.addData('title', payload.head);
  if(payload.image) {
    message.addData('image', payload.image);  
  }
  if(payload.promo_obj) {
    var data = JSON.stringify(payload.promo_obj);
    message.addData('promo_obj', data);   
  }
  
  if(payload.state) {
    message.addData('state', payload.state);
    message.addData('time', payload.time);  
    message.addData('order_id', payload.order_id);
  }

  message.addData('msgcnt', '1'); 
  message.addData('soundname', 'beep.wav'); 
  message.timeToLive = 10000; 

  var registrationIds = [];
  registrationIds = registrationIds.concat(payload.gcms);

  logger.log(message);
  
  sender.send(message, registrationIds, 4, function(err, response) {
    if(err) {
      logger.log('in error');
      logger.log(err);
    }
    else{
      logger.log('in success');
      logger.log(response.success);
      logger.log(response.failure);
      logger.log(response.canonical_ids);
      
    }
    deferred.resolve(response);
  });


  return deferred.promise;
}
