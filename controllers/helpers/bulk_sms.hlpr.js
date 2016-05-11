var Q = require('q');
var AuthHelper = require('../../common/auth.hlpr');
var transporter = require('../../transports/transporter');
var User = require('../../models/user.mdl');

var checkBlacklisted = function(number) {
  var deferred = Q.defer();
  User.findOne({phone: number}, function(err, user){
    if(err || !user) {
      console.log(err);
      deferred.reject({
        err: err
      });
    } else if (
        user.blacklisted.is_blacklisted === true ||
        user.messaging_preferences.block_all.sms.promo === true ||
        user.messaging_preferences.block_all.sms.trans === true
      ) {
        deferred.reject({
          send: false
        });
      } else {
        deferred.resolve({
          send: true,
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
