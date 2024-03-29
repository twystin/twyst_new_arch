'use strict';
/*jslint node: true */

var keygen = require('keygenerator');
var mongoose = require('mongoose');
var moment = require('moment');
var Q = require('q');
var logger = require('tracer').colorConsole();

require('../../models/auth_token.mdl.js');
require('../../models/auth_code.mdl.js');
require('../../models/account.mdl.js');
require('../../models/user.mdl.js');
var AuthToken = mongoose.model('AuthToken');
var AuthCode = mongoose.model('AuthCode');
var Account = mongoose.model('Account');
var User = mongoose.model('User');
var Event = mongoose.model('Event');
var _ = require('underscore');
var Cache = require('../../common/cache.hlpr.js');
var Friend = mongoose.model('Friend');

module.exports.delete_auth_token = function(token) {
  logger.log();
  var deferred = Q.defer();
  AuthToken.findOneAndRemove({
    token: token
  }, function(err, data) {
    if (err) {
      deferred.reject(err || null);
    } else {
      if (!data) {
        deferred.resolve("User is already logged out")
      } else {
        deferred.resolve("Logged out the user");
      }
    }
  });

  return deferred.promise;
};

module.exports.save_auth_token = function(data) {
  logger.log();

  var passed_data = data;
  var account = passed_data.account;
  var user = passed_data.user;

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
      deferred.reject(err || true);
    } else {
      passed_data.token = saved_token;
      deferred.resolve(passed_data);
    }
  });

  return deferred.promise;
};

module.exports.populate_cache = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var user = passed_data.user;

  Event.find({
    'event_user': mongoose.Types.ObjectId(user)
  }, function(err, events) {
    if (!err) {
      var event_map = _.groupBy(events, function(item) {
        return item.event_type;
      });

      var checkin_map = _.reduce(event_map.checkin, function(memo, item) {
        memo[item.event_outlet] = memo[item.event_outlet] + 1 || 1;
        return memo;
      }, {});

      Cache.hset(user, 'checkin_map', JSON.stringify(checkin_map));
      deferred.resolve(passed_data);
    } else {
      deferred.reject(err);
    }
  });
  return deferred.promise;
};

module.exports.create_user_account = function(phone) {
  logger.log();
  var deferred = Q.defer();
  var return_data = {};

  User.findOne({
    phone: phone
  }, function(err, user) {
    if (err) {
      deferred.reject({
        err: err,
        message: 'Error registering user'
      });
    } else {
      if (user) {
        return_data.user = user;
        return_data.account = null;
        deferred.resolve({
          data: return_data,
          message: 'User already exists'
        });
      } else {
        var new_user = new User({
          phone: phone,
          validation: {
            otp: true
          },
          role: 6
        });
        var friend = new Friend();
        friend.save(function(err, user_friend){
            if (err || !user_friend) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t create user'
              });
            }
            else{
                new_user.friends = user_friend._id;   
                new_user.save(function(err, saved_user) {
                    if (err || !saved_user) {
                        deferred.reject({
                          err: err || true,
                          message: 'Couldn\'t create user'
                        });
                    } 
                    else {
                        var account = {
                          username: phone,
                          user: saved_user._id
                        };

                        Account.register(
                          new Account(account),
                          phone,
                          function(err, created_account) {
                            if (err) {
                              deferred.reject({
                                err: err,
                                message: 'Error creating account'
                              });
                            } else {
                              return_data.user = saved_user;
                              return_data.account = created_account;
                              deferred.resolve({
                                data: return_data,
                                message: 'Created a new account'
                              });
                            }
                          }
                        );
                    }
                  
                });
            }
        })
        
      }
    }
  });

  return deferred.promise;
};

module.exports.create_merchant = function(merchant) {
  var deferred = Q.defer();

  var acc = new Account(merchant);
  var user = new User({activities: ['outlet.create','outlet.update' ,'outlet.view' , 'outlet.remove'], is_paying: merchant.isPaying || false, role: merchant.role });
  if(merchant.email) {
    user.email = merchant.email;
  }
  user.save(function(err) {
    if(err) {
      deferred.reject({
        error: err || true,
        message: 'Unable to register the merchant'
      });
    } else {
      acc.setPassword(merchant.password, function(err) {
        if(err) {
          deferred.reject({
            error: err || true,
            message: 'Unable to register the merchant'
          });
        } else {
          acc.user = user._id;
          acc.save(function(err) {
            if(err) {
              deferred.reject({
                error: err || true,
                message: 'Unable to register the merchant'
              });
            } else {
              deferred.resolve({
                data: acc,
                message: 'Merchant registered successfully'
              });
            }
          });
        }
      });
    }
  });

  return deferred.promise;
}

module.exports.generate_new_code = function(phone) {
  var deferred = Q.defer();

  var ac = new AuthCode({
    phone: phone,
    code: keygen.number({
      length: 4
    }),
    status: 'active',
    created_at: new Date()
  });

  ac.save(function(err, code) {
    if (err || !code) {
      deferred.reject({
        err: err || true,
        message: 'Couldn\'t save auth code'
      });
    } else {
      deferred.resolve({
        data: code,
        message: 'Saved auth code'
      });
    }
  });

  return deferred.promise;
};

module.exports.verify_user_email = function(token) {
    logger.log();
    var deferred = Q.defer();
    console.log(token);
    User.findOne({
        'validation.verification_mail_token': token
    }).exec(function (err, user) {
        if(err) {
            deferred.reject({
                err: err || true,
                message: 'Sorry, Error verifying email.'
            });
        }
        else {
            if(user) {
                user.validation.email = true;
                user.save(function (err) {
                    if(err) {                        
                        deferred.reject({
                            err: err || true,
                            message: 'Sorry, Error verifying email.'
                        });
                    }
                    else {                        
                        deferred.resolve({
                            data: user,
                            message: 'Email has been verified successfully.'
                        });           
                    }
                })
            }
            else {
                deferred.reject({
                    err: err || true,
                    message: 'Sorry, This link is invalid.'
                });
            }
        }
    });
    
    return deferred.promise;
};
