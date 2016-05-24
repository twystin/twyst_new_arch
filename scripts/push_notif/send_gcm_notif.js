var transporter = require('../../transports/transporter');
var mongoose = require('mongoose');
var Notification = require('../../models/notification.mdl');
var Event = require('../../models/event.mdl');
var Outlet = require('../../models/outlet.mdl');
var User = require('../../models/user.mdl');
var Notification = require('../../models/notification.mdl');
var _ = require('underscore');

//mongoose.connect('mongodb://localhost/retwyst');
mongoose.connect('mongodb://54.189.82.86:27017/retwyst');

var meta = {};
meta.head = "Red Hot Rs 150 Cashback";
meta.body = "Use Code FLAT150 and Earn  Rs 150 Cashback on your 1st order (Min Rs 300) Get Extra 10% Cashback when you Pay by Mobikwik Wallet Order Now !";
meta.image = "https://s3-us-west-2.amazonaws.com/retwyst-app/22.jpg";

User.find({push_ids: {$exists: true},
  $where: 'this.push_ids.length > 0'
}).exec(function(err, users) {
    if (err || !users) {
        console.log('in err');
    } else {
        _.each(users, function(user){
            if(user.orders.length === 0) {
                var notif = {};
                notif.message  = meta.head;
                notif.detail  = meta.body;
                notif.icon  = 'promo';
                notif.expire  = new Date();
                notif.shown  = false;
                notif.image = meta.image;
                notif.link  = 'discover';
                notif.user  = user._id;
                notif.status = 'sent';
                notif.notification_type = 'push';
                notif.created_at = new Date();
                var notifs = new Notification(notif);

                notifs.save(function(err, notif){
                    if(err) {
                        console.log("notification save failed");
                    }
                    else{
                        console.log("notification save successful");
                        meta.gcms = user.push_ids[user.push_ids.length-1].push_id;

                        transporter.send('push', 'gcm', meta).then(function(data) {

                            if(data.success) {
                                console.log(user.phone);
                            }


                         }, function(err) {
                            console.log(err);
                        });

                    }
                });
            }
        });
    }
});
