'use strict';
/*jslint node: true */

var keygen = require('keygenerator');
var mongoose = require('mongoose');
var moment = require('moment');
var Q = require('Q');

require('../models/auth_token.mdl.js');
require('../models/auth_code.mdl.js');
var AuthToken = mongoose.model('AuthToken');
var AuthCode = mongoose.model('AuthCode');
var HttpHelper = require('../common/http.hlpr.js');
var DTHelper = require('../common/datetime.hlpr.js');
var SMSHelper = require('../common/sms.hlpr.js');

// Log the user in and generate an auth token which will be needed in every API call to authenticate the user
module.exports.login = function(req, res) {
  var token = keygen.session_id();
  var auth_token = new AuthToken({
    token: token,
    expiry: moment().add(7, 'days'),
    account: req.user._id,
    user: req.user.user
  });

  auth_token.save(function(err) {
    HttpHelper.response({
      response: res,
      error: err,
      success_data: auth_token,
      success_message: "Successfully logged in the user.",
      error_data: err,
      error_message: "Could not save the OAuth token. Try again."
    });
  });
};

module.exports.create_authcode = function(req, res) {
  var phone = req.params.phone;
  var code = '';
  if (!phone) {
    HttpHelper.error(res, true, 'Phone number required for verification');
  }

  AuthCode.findOne({phone:phone}, function(err, authcode) {
    if (err) {
      HttpHelper.error(res, err, 'Couldn\'t get authcode');
    } else {
      if (authcode) {
        if (authcode.status === 'used') {
          // Create a new auth code
          generate_new_code(phone).then(function(auth_data) {
            var message = 'Your Twyst verification code is ' + auth_data.code;
            SMSHelper.send_sms(phone, message).then(function(sms_data) {
              HttpHelper.success(res, auth_data.data, auth_data.message);
            }, function(err) {
              HttpHelper.error(res, err.err, err.message);
            });
          }, function(err) {
            HttpHelper.error(res, err.err, err.message);
          });
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
              generate_new_code(phone).then(function(auth_data) {
                var message = 'Your Twyst verification code is ' + auth_data.code;
                SMSHelper.send_sms(phone, message).then(function(sms_data) {
                  HttpHelper.success(res, auth_data.data, auth_data.message);
                }, function(err) {
                  HttpHelper.error(res, err.err, err.message);
                });
              }, function(err) {
                HttpHelper.error(res, err.err, err.message);
              });
            }
          }
        }
      } else {
        // Create a new authcode
        generate_new_code(phone).then(function(auth_data) {
          var message = 'Your Twyst verification code is ' + auth_data.code;
          SMSHelper.send_sms(phone, message).then(function(sms_data) {
            HttpHelper.success(res, auth_data.data, auth_data.message);
          }, function(err) {
            HttpHelper.error(res, err.err, err.message);
          });
        }, function(err) {
          HttpHelper.error(res, err.err, err.message);
        });
      }
    }
  });
};

module.exports.verify_authcode_and_create_account = function(req, res) {
  res.send(405);
};


// Helper functions
function generate_new_code(phone) {
  var deferred = Q.defer();

  var ac = new AuthCode({
    phone: phone,
    code: keygen.number({length: 4}),
    status: 'active',
    created_at: new Date()
  });

  ac.save(function(err, code) {
    if (err || !code) {
      deferred.reject({err: err || true, message: 'Couldn\'t save auth code'});
    } else {
      deferred.resolve({data: code, message: 'Saved auth code'});
    }
  });

  return deferred.promise;
}
