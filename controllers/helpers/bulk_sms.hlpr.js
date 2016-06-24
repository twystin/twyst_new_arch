var Q = require('q');
var AuthHelper = require('../../common/auth.hlpr');
var Cache = require('../../common/cache.hlpr');
var transporter = require('../../transports/transporter');
var User = require('../../models/user.mdl');

var checkBlacklisted = function(number) {
  var deferred = Q.defer();

  Cache.get('optout_users', function(err, users) {
    if (err || !users) {
      console.log();
      deferred.reject('Could not get users who\'ve opted out');
    } else {
      var users = JSON.parse(users);
      users.forEach(function(user){
        if(user.phone === number) {
          if(user.blacklisted.is_blacklisted) {
            deferred.reject({
              send: false,
              reason: "This user is blacklisted."
            });
          } else if(user.messaging_preferences.block_all.sms.promo) {
            deferred.reject({
              send: true,
              reason: "This user has opted out smses."
            });
          }
        }
      });
      deferred.resolve({
        send: true
      });
    }
  });

  return deferred.promise;
};

module.exports.sendMessage = function(token, messageObj) {
    var deferred = Q.defer();
    var successNumbers = [];
    var failNumbers = [];

    var payload = {
      from: messageObj.header || null,
      message:messageObj.body || null,
      phone: messageObj.phone_number || null
    };
    console.log("message: ", payload.message);
    AuthHelper.get_user(token).then(function(data) {
        checkBlacklisted(messageObj.phone_number).then(function(data) {
            transporter.send('sms', 'vf', payload)
              .then(function(res) {
                deferred.resolve({
                  data: messageObj.phone_number,
                  message: "Messages sent"
                });
              },function(err) {
                console.log(err);
                deferred.reject({
                  err: err || false,
                  data: messageObj.phone_number,
                  message: "Message Couldn't be sent."
                });
              });
        }, function(err) {
          deferred.reject({
            err: err || false,
            message: "User not found"
          });
        });
    }), (function(err){
      deferred.reject(err);
    });

    return deferred.promise;
};
