var transporter = require('../../transports/transporter');
var mongoose = require('mongoose');
var Notification = require('../../models/notification.mdl');
var Event = require('../../models/event.mdl');
var Outlet = require('../../models/outlet.mdl');
mongoose.connect('mongodb://localhost/retwyst');
var results = [];
var meta = {};
var users = require('./users').user_grid;
meta.head = "Voucher Reminder";
meta.body = "A reminder that your current voucher(s) at Biryani Blues are expiring soon, so hurry! Redeem it now. For help, write to support@twyst.in.";

var notif = {};
notif.message  = meta.head;
notif.detail  = meta.body;
notif.icon  = 'checkin';
notif.expire  = new Date();
notif.shown  = false;
notif.link  = 'discover';
notif.user  = meta.user;
notif.status = 'sent';
notif.notification_type = 'push';
notif.created_at = new Date();

function pushNotification(userObj) {
  meta.user = userObj.user_id;
  meta.gcms = userObj.gcm_id;
  var notification = new Notification(notif);

  notification.save(function(err, saved_event){
    if(err || !saved_event) {
      console.log(err)
      deferred.reject({
        err: err || true
      });
    }
    else{
        transporter.send('push', 'gcm', meta).then(function(data) {
      	    console.log(data);
         }, function(err) {
      	    console.log(err);
        });
      }
    });

}

users.forEach(pushNotification);
