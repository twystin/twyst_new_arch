var transporter = require('../../transports/transporter');
var mongoose = require('mongoose');
var Notification = require('../../models/notification.mdl');
var Event = require('../../models/event.mdl');
var Outlet = require('../../models/outlet.mdl');
// mongoose.connect('mongodb://localhost/retwyst');
mongoose.connect('mongodb://54.189.82.86:27017/retwyst');
var results = [];
var meta = {};
var users = require('./users').user_grid;
meta.head = "Hurry !! Last Day to Earn Rs 150 Cashback";
meta.body = "Beat the Monday Blues with Rs 150 Cashback on your First Order .Use Code FLAT150 ( Min Order Rs 300/-) TnC Apply. Hurry Offer Ends Today!! Order Now! Now you can recharge your Phone, Shop Online and Avail Amazing Food Deals using Twyst Cash.";
meta.image ="https://s3-us-west-2.amazonaws.com/retwyst-app/push_notifications/5.Notification_creative.jpg";
var notif = {};
notif.message  = meta.head;
notif.detail  = meta.body;
notif.icon  = 'checkin';
notif.expire  = new Date();
notif.shown  = false;
notif.image = "https://s3-us-west-2.amazonaws.com/retwyst-app/push_notifications/5.Notification_creative.jpg";
notif.link  = 'discover';
notif.user  = meta.user;
notif.status = 'sent';
notif.notification_type = 'push';
notif.created_at = new Date();

function pushNotification(userObj) {
  meta.user = userObj._id;
  meta.gcms = userObj.push_id;
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
