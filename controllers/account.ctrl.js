'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
require('../models/auth_code.mdl.js');
var AuthCode = mongoose.model('AuthCode');
var Event = mongoose.model('Event');

var HttpHelper = require('../common/http.hlpr.js');
var DTHelper = require('../common/datetime.hlpr.js');
var SMSHelper = require('../common/sms.hlpr.js');
var AccountHelper = require('./helpers/account.hlpr.js');
var Cache = require('../common/cache.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');

var _ = require('lodash');
var Q = require('q');
var logger = require('tracer').colorConsole();

module.exports.login = function(req, res) {
  logger.info();
  var passed_data = {};
  passed_data.account = _.get(req, 'user._id');
  passed_data.user = _.get(req, 'user.user');

  AccountHelper.save_auth_token(passed_data)
    .then(function(data) {
      return AccountHelper.populate_cache(data);
    })
    .then(function(data) {
      return AuthHelper.get_user(data.token.token);
    })
    .then(function(data) {
      if(data.data.role === 3) {
        HttpHelper.success(res, data, "Logged in successfully");  
      }
      else{
        HttpHelper.success(res, data.data.token, "Logged in successfully");   
      }
      
    })
    .fail(function(err) {
      console.log(err)
      HttpHelper.error(res, err, "Error logging in");
    });
};

module.exports.logout = function(req, res) {
  logger.info();
  var token = _.get(req, 'query.token');
  if (!token) {
    HttpHelper.error(res, null, "No user to logout!");
  }

  AccountHelper.delete_auth_token(token)
    .then(function(data) {
      HttpHelper.success(res, data, "Logged out successfully.");
    }, function(err) {
      HttpHelper.error(res, err, "Could not log the user out.");
    });
};

module.exports.create_authcode = function(req, res) {
  logger.info();
  var phone = _.get(req, 'params.phone');
  var code = '';
  if (!phone) {
    HttpHelper.error(res, null, 'Phone number required for verification');
  }

  AuthCode.find({
    phone: phone
  }).sort({
    created_at: -1
  }).exec(function(err, authcodes) {
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
        get_code_and_send(res, phone);
      }
    }
  });
};

module.exports.verify_authcode_and_create_account = function(req, res) {
  logger.info();

  var phone = _.get(req, 'body.phone');
  var authcode = _.get(req, 'body.code');

  if (phone && authcode) {
    AuthCode.findOne({
      phone: phone,
      code: authcode
    }, function(err, code) {
      if (err || !code) {
        HttpHelper.error(res, err || null, 'Incorrect verification code');
      } else {
        AccountHelper.create_user_account(phone).then(function(data) {
          var passed_data = {};
          passed_data.account = _.get(data, 'data.account._id');
          passed_data.user = _.get(data, 'data.user._id');
          AccountHelper.save_auth_token(passed_data)
            .then(function(data) {
              var return_data = {};
              return_data.token = _.get(data, 'token.token');
              HttpHelper.success(res, return_data, "Successfully created account");
            }, function(err) {
              HttpHelper.error(res, err, "Could not create account");
            });
        });
      }
    });
  } else {
    HttpHelper.error(res, null, 'Please send authcode and phone number for verification!');
  }
};

module.exports.register_merchant = function(req, res) {
  logger.info();

  var merchant = req.body;
  if (!_.has(merchant, 'username') || !_.has(merchant, 'password')) {
    HttpHelper.error(res, null, "Username and password are mandatory");
  } else if (merchant.isPaying && !_.has(merchant, 'email')) {
    HttpHelper.error(res, null, "Email is mandatory for paying merchant"); 
  } else {
    AccountHelper.create_merchant(merchant).then(function(data) {
      HttpHelper.success(res, data.data, data.message);
    }, function(err) {
      HttpHelper.error(res, err.error, err.message);
    });
  }
}

// Helper functions
function get_code_and_send(res, phone) {
  logger.info();
  AccountHelper.generate_new_code(phone).then(function(auth_data) {
    if (_.get(auth_data, 'data.code')) {
      var message = 'Your Twyst verification code is ' + _.get(auth_data, 'data.code');
      SMSHelper.send_sms(phone, message).then(function(sms_data) {
        HttpHelper.success(res, auth_data.data, auth_data.message);
      }, function(err) {
        HttpHelper.error(res, err.err, err.message);
      });
    } else {
      HttpHelper.error(res, err.err, err.message);
    }
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
}