'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('Friend');
var Friend = mongoose.model('Friend');
var AuthHelper = require('../../common/auth.hlpr.js');


module.exports.update_user = function(token, updated_user) {
  var deferred = Q.defer();

  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    user = _.extend(user, updated_user);
    User.findOneAndUpdate({
      _id: user._id
    }, {
      $set: user
    }, {
      upsert: false,
      overwrite: true
    }).exec(function(err, u) {
      console.log(err);
      if (err || !u) {
        deferred.reject({
          err: err || true,
          message: "Couldn\'t update user"
        });
      } else {
        deferred.resolve({
          data: user,
          message: 'Updated user'
        });
      }
    });
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: "Couldn\'t find user"
    });
  });

  return deferred.promise;
};

module.exports.update_friends = function(token, friend_list) {
  var deferred = Q.defer();
  
  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    User.findOneAndUpdate({
        _id: user._id
      }, {
        $set: {
          friend_source: friend_list.source,
          friend_list: friend_list.list
        }
      }, {
        upsert: true
      },
      function(err, u) {
        if (err || !u) {
          deferred.reject({
            err: err || true,
            message: "Couldn\'t update user"
          });
        } else {
          deferred.resolve({
            data: u,
            message: 'Updated user'
          });
        }
      }
    );
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: "Couldn\'t find user"
    });
  });

  return deferred.promise;
};


module.exports.update_referral = function(friend_token, friend_list_id, friend_referred_by, friend_source) {
    var deferred = Q.defer();
    
    AuthHelper.get_user(friend_token).then(function(data) {
        var user = data.data;

        var friend = new Friend({
            
        })

        var update_referral = {
            $push: {
                friends: {
                    _id: mongoose.Types.ObjectId(),
                    source: friend_source,
                    add_date: new Date(),
                    phone: user.phone,
                    email: user.email,
                    user: user._id
                }
            }
        }

        var update_user = {
            $push: {
                friends: {
                    _id: mongoose.Types.ObjectId(),
                    source: friend_source,
                    add_date: new Date(),
                    phone: friend_referred_by.phone,
                    email: friend_referred_by.email,
                    user: friend_referred_by._id
                }
            }

        }
        if(friend_list_id) {
            Friend.findOneAndUpdate({
                _id:friend_list_id
                }, 
                update_referral,
                function(err, u) {
                if (err || !u) {
                  deferred.reject({
                    err: err || true,
                    message: "Couldn\'t update user"
                  });
                } else {
                  deferred.resolve({
                    data: u,
                    message: 'Updated user'
                  });
                }
            });
        }
        else{
            friend.save(function(err, code) {
                if (err || !code) {
                  deferred.reject({
                    err: err || true,
                    message: 'Couldn\'t save referral '
                  });
                } else {
                    Friend.findOneAndUpdate({
                        _id: friend._id
                        }, 
                        update_referral,
                        function(err, u) {
                        if (err || !u) {
                          deferred.reject({
                            err: err || true,
                            message: "Couldn\'t save Referral"
                          });
                        } else {
                          deferred.resolve({
                            data: u,
                            message: 'Saved Referral'
                          });
                        }
                    });

                  
                }
              });
        }
    });

    

    return deferred.promise;
};