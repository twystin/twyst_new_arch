'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Outlet = mongoose.model('Outlet');
var Event = mongoose.model('Event');
var Notification = mongoose.model('Notification');
var Transporter = require('../../transports/transporter.js');

module.exports.send_notification = function(data, message, header){
  logger.log();
  var deferred = Q.defer();
  console.log(message);
  var user = data.user;
  
  var gcm_ids = _.get(user, 'push_ids');
  var payload = {};   

  if(gcm_ids && gcm_ids.length) {  
    payload.body = message;  
    payload.head = header; 
    payload.gcms = gcm_ids[gcm_ids.length-1].push_id;

    var notif = {};
    notif.message  = header;
    notif.detail  = message;
    notif.icon  = 'checkin';
    notif.expire  = new Date();
    notif.shown  = false;
    notif.link  = 'discover';
    notif.user  = user._id;
    notif.status = 'sent';
    notif.outlet  = data.outlet._id;
    notif.notification_type = 'push'; 
    notif.created_at = new Date();
    var notification = new Notification(notif);
    
    notification.save(function(err, saved_event){
      if(err || !saved_event) {
        console.log(err)
        deferred.reject({
          err: err || true
        }); 
      }
      else{
        Transporter.send('push', 'gcm', payload).then(function(){
          deferred.resolve();    
        }, function(err) {
          deferred.reject({
            err: err || true
          }); 
        });
      }
    })
  }
  else{
    payload.from = 'TWYSTR';
    payload.message = message + " Don't have the app? Get it now at http://twy.st/app";
    payload.phone = user.phone;
    Transporter.send('sms', 'vf', payload).then(function(){
      deferred.resolve();    
    }, function(err) {
      deferred.reject({
        err: err || true
      }); 
    });
  }

  return deferred.promise;

}