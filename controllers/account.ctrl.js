'use strict';
/*jslint node: true */

var keygen = require('keygenerator');
var mongoose = require('mongoose');
var _ = require('underscore');

require('../models/auth_code.mdl.js');
var AuthCode = mongoose.model('AuthCode');
var Event = mongoose.model('Event');
var HttpHelper = require('../common/http.hlpr.js');
var DTHelper = require('../common/datetime.hlpr.js');
var SMSHelper = require('../common/sms.hlpr.js');
var AccountHelper = require('./helpers/account.hlpr.js');
var Cache = require('../common/cache.hlpr.js');

// Log the user in and generate an auth token which will be needed in every API call to authenticate the user
module.exports.login = function(req, res) {
  AccountHelper.save_auth_token(req.user._id, req.user.user).then(function(data) {
    Event.find({'event_user': mongoose.Types.ObjectId(req.user._id)}, function(err, events) {
      if (!err) {
        var event_map = _.groupBy(events, function(item) {
          return item.event_type;
        });
        // console.log(event_map.checkin);
        // Cache[req.user._id] = Cache[req.user._id] || {};
        var checkin_map = _.reduce(event_map.checkin, function(memo, item) {
          memo[item.event_outlet] = memo[item.event_outlet] + 1 || 1;
          return memo;
        }, {});
        //var favourite_map = _.reduce(event_map.favourite, function(memo, item) {
        //  memo[item.event_outlet] = memo[item.event_outlet] + 1 || 1;
        //  return memo;
        //}, {});

        //console.log(req.user);
        //var favourite_map = _.reduce(req.user.user.following, function(memo, item) {
        //  memo[item] = 1;
        //}, {});

        //console.log(favourite_map);

        Cache.hset(req.user._id, 'checkin_map', JSON.stringify(checkin_map));
        //Cache.hset(req.user._id, 'favourite_map', JSON.stringify(favourite_map));

      }

      HttpHelper.success(res, data.data, data.message);
    });
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
};

module.exports.logout = function(req, res) {
  var token = req.query.token || null;
  if (!token) {
    HttpHelper.error(res, null, "No user to logout!");
  }

  AccountHelper.delete_auth_token(token).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
};

module.exports.create_authcode = function(req, res) {
  var phone = req.params.phone;
  var code = '';
  if (!phone) {
    HttpHelper.error(res, null, 'Phone number required for verification');
  }

  AuthCode.find({phone:phone}).sort({created_at:-1}).exec(function(err, authcodes) {
    if (err) {
      HttpHelper.error(res, err, 'Couldn\'t get authcode');
    } else {
      if (authcodes.length !== 0) {
        var authcode = authcodes[0];
        if (authcode.status === 'used') {
          // Create a new auth code
          get_code_and_send(res, phone);
        } else {
          // 3 cases - less than 5 minutes, send same authcode or new authcode.
          var timediff = DTHelper.timediff(authcode.created_at);
          if (timediff < DTHelper.fiveminutes) {
            // Send error message
            HttpHelper.error(res, err, 'We have already sent you an authentication code.');
          } else {
            if (timediff < DTHelper.oneday) {
              // Send same authcode
              var message = 'Your Twyst verification code is ' + authcode.code;
              SMSHelper.send_sms(phone, message).then(function(sms_data) {
                HttpHelper.success(res, authcode, 'Resending your unused auth code');
              }, function(err) {
                HttpHelper.error(res, err.err, err.message);
              });
            } else {
              // Send new authcode
              get_code_and_send(res, phone);
            }
          }
        }
      } else {
        // Create a new authcode
        get_code_and_send(res,phone);
      }
    }
  });
};

module.exports.verify_authcode_and_create_account = function(req, res) {
  var phone = req.body.phone + '';
  var authcode = req.body.code + '';

  if (phone && authcode) {
    AuthCode.findOne({
      phone: phone,
      code: authcode
    }, function(err, code) {
      if (err || !code) {
        HttpHelper.error(res, err || null, 'Incorrect verification code');
      } else {
        AccountHelper.create_user_account(phone).then(function(data) {
          AccountHelper.save_auth_token(data.data.account && data.data.account._id || null,
                          data.data.user && data.data.user._id || null)
          .then(function(data) {
            HttpHelper.success(res, data.data, data.message);
          }, function(err) {
            HttpHelper.error(res, err.err, err.message);
          });
        });
      }
    });
  } else {
    HttpHelper.error(res, null, 'Please send authcode and phone number for verification!');
  }
};

// Helper functions
function get_code_and_send(res, phone) {
  AccountHelper.generate_new_code(phone).then(function(auth_data) {
    if (auth_data.data.code) {
      var message = 'Your Twyst verification code is ' + auth_data.data.code;
      SMSHelper.send_sms(phone, message).then(function (sms_data) {
        HttpHelper.success(res, auth_data.data, auth_data.message);
      }, function (err) {
        HttpHelper.error(res, err.err, err.message);
      });
    } else {
      HttpHelper.error(res, err.err, err.message);
    }
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
}
