var Q = require('q');
var AuthHelper = require('../../common/auth.hlpr');
var transporter = require('../../transports/transporter');

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

AuthHelper.get_user(token)
  .then(function(data) {
    console.log(payload);
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

return deferred.promise;
};
