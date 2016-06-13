var _ = require('underscore');
var Q = require('q');

var transporter = require('../../transports/transporter');
var mongoose = require('mongoose');
var AuthHelper = require('../../common/auth.hlpr');
var Notification = require('../../models/notification.mdl');
var Event = require('../../models/event.mdl');
var Outlet = require('../../models/outlet.mdl');
var User = require('../../models/user.mdl');
var Notification = require('../../models/notification.mdl');

var queryMake = function(subject, number) {
  var query = {};
  if(subject === "all") {
    query = { push_ids: {$exists: true},
      $where: 'this.push_ids.length > 0'
    }
  } else if(subject === "non-transacted") {
    query = {
      $and: [
        {push_ids: {$exists: true}},
        {$where: 'this.push_ids.length > 0'},
        {$where: 'typeof this.orders !== "undefined" && this.orders.length === 0'}
      ],
    };
  } else if(subject === "transacted") {
    query = {
      $and: [
        {push_ids: {$exists: true}},
        {$where: 'this.push_ids.length > 0'},
        {$where: 'typeof this.orders !== "undefined" && this.orders.length > 0'}
      ],
    };
  } else if (subject === "test") {
    query = {
          phone: number,
          push_ids: {$exists: true},
          $where: 'this.push_ids.length > 0'
        };
  } else if (subject === "default") {
    query = "quit";
  }
   return query;
}

module.exports.sendNotification = function(token, notif) {
  var deferred = Q.defer();
  var meta = {};
  var query = {};
  meta.head = notif.message;
  meta.body = notif.detail;
  meta.image = notif.image;
  if(typeof notif.test_number !== "undefined" && notif.test_number !== null) {
    query = queryMake(notif.user_class, notif.test_number);
  } else {
    query = queryMake(notif.user_class);
  }

  AuthHelper.get_user(token).then(function(data) {

    if( typeof query === "string" && query === "none") {
      deferred.reject({
        err: err || false,
        message: "Target not provided"
      });
    } else {
      User.find(query).exec(function(err, users) {
          if (err || !users) {
            console.log(err);
            deferred.reject({
              err: err || false,
              message: "User corresponding to gcm-id not found"
            });
          } else {
              _.each(users, function(user){
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
                              deferred.reject({
                                err: err || false,
                                message: "Notification could not be saved"
                              });
                          } else{
                              meta.gcms = user.push_ids[user.push_ids.length-1].push_id;
                              transporter.send('push', 'gcm', meta).then(function(data) {
                                  if(data.success) {
                                    deferred.resolve({
                                      err: err || false,
                                      message: "Notification sent and saved"
                                    });
                                  }
                               }, function(err) {
                                 deferred.reject({
                                   err: err || false,
                                   message: "Notification couldn't be sent"
                                 });
                              });
                              console.log(notif);
                              deferred.resolve({
                                err: err || false,
                                message: "Notification sent and saved"
                              });
                          }
                      })
              });
          }
      });
    }
  }, function(err) {
      deferred.reject({
        err: err || false,
        message: "User not found"
      });
    });


  return deferred.promise;
};
