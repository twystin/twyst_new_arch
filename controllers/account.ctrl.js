'use strict';
/*jslint node: true */

var keygen = require('keygenerator');
var mongoose = require('mongoose');
var moment = require('moment');
var Q = require('Q');

require('../models/auth_token.mdl.js');
require('../models/auth_code.mdl.js');
require('../models/account.mdl.js');
require('../models/user.mdl.js');
var AuthToken = mongoose.model('AuthToken');
var AuthCode = mongoose.model('AuthCode');
var Account = mongoose.model('Account');
var User = mongoose.model('User');

var HttpHelper = require('../common/http.hlpr.js');
var DTHelper = require('../common/datetime.hlpr.js');
var SMSHelper = require('../common/sms.hlpr.js');
// Log the user in and generate an auth token which will be needed in every API call to authenticate the user
module.exports.login = function(req, res) {
  save_auth_token(req.user._id, req.user.user).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
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
        HttpHelper.error(res, err || true, 'Incorrect verification code');
      } else {
        create_user_account(phone).then(function(data) {
          save_auth_token(data.data.account && data.data.account._id || null,
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
    HttpHelper.error(res, true, 'Please send authcode and phone number for verification!');
  }
};


// Helper functions
function save_auth_token(account, user) {
  var deferred = Q.defer();
  var token = keygen.session_id();
  var auth_token = new AuthToken({
    token: token,
    expiry: moment().add(7, 'days'),
    account: account,
    user: user
  });

  auth_token.save(function(err, saved_token) {
    if (err || !saved_token) {
      deferred.reject({err: err || true, message: 'Couldn\'t save token'});
    } else {
      deferred.resolve({data: saved_token, message: 'Saved the token successfully'});
    }
  });

  return deferred.promise;
}

function create_user_account(phone) {
  var deferred = Q.defer();
  var return_data = {};

  User.findOne({phone: phone}, function(err, user) {
    if (err) {
      deferred.reject({err:err, message:'Error registering user'});
    } else {
      if (user) {
        return_data.user = user;
        return_data.account = null;
        deferred.resolve({data: return_data, message: 'User already exists'});
      } else {
        var new_user = new User({
          phone: phone,
          validation: {
            otp: true
          }
        });
        new_user.save(function(err, saved_user) {
          if (err || !saved_user) {
            deferred.reject({err: err || true, message: 'Couldn\'t create user'});
          } else {
            var account = {
              username: phone,
              role: 7,
              user: saved_user._id
            };

            Account.register(
              new Account(account),
              phone,
              function(err, created_account) {
                if (err) {
                  deferred.reject({err: err, message: 'Error creating account'});
                } else {
                  return_data.user = saved_user;
                  return_data.account = created_account;
                  deferred.resolve({data: return_data, message: 'Created a new account'});
                }
              }
            );
          }
        });
      }
    }
  });

  return deferred.promise;
}


function get_code_and_send(res, phone) {
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
