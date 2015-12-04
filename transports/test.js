var transporter = require('./transporter');
var mongoose = require('mongoose');
var Notification = require('../models/notification.mdl');
var Event = require('../models/event.mdl');
var Outlet = require('../models/outlet.mdl');

mongoose.connect('mongodb://54.189.82.86/retwyst');
var results = [];
var meta = {};
meta.head = "Voucher Reminder";
meta.user = "5652e5f6550a479f031f0a7d";
meta.body = "A reminder that your current voucher(s) at Biryani Blues are expiring soon, so hurry! Redeem it now. For help, write to support@twyst.in.";
meta.gcms = 'APA91bFrCbU_p68zgFXLohZEU_LZ9K0dY3yF-1v2ANT1bAUKetq4HK2q7E9Oz2QlDyQxriauh-R_tto0KaRtSdhsSRAi7oB_FgkoafFKnaxBIQVOIJ96eCjukzhEg9PhTbMIBcY_-SVY';

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
	})
  }
})
