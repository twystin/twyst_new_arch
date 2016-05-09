var Q = require('q');
var AuthHelper = require('../../common/auth.hlpr');
var _ = require('lodash')
var transporter = require('../../transports/transporter');
var User = require('../../models/user.mdl');

var checkBlacklist = function(number) {
  var deferred = Q.defer();
  User.findOne({phone: number}, function(err, user){
    if(err) {
      console.log(err);
      deferred.reject({
        err: err
      });
    } else if(Object.keys(user).length > 0 || user.length > 0) {
      if(
        _.get(user.blacklisted, 'is_blacklisted', false) ||
        _.get(user, 'messaging_preferences.block_all.sms.promo', false) ||
        _.get(user, 'messaging_preferences.block_all.sms.trans', false)
      ) {
        deferred.reject({
          send: false
        });
      } else {
        deferred.resolve({
          send: true,
        });
      }
    }
  });
  return deferred.promise;
};


module.exports.sendMessage = function(token, messageObj) {
var deferred = Q.defer();
var successNumbers = [];
var failNumbers = [];
console.log(messageObj);

var payload = {
  from: messageObj.header || null,
  message:messageObj.body || null,
  phone: messageObj.phone_number || null
};

checkBlacklist(messageObj.phone_number).then(function(data) {
  AuthHelper.get_user(token)
    .then(function(data) {
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
}).catch(function(err){
  deferred.reject(err);
});

  return deferred.promise;
};
