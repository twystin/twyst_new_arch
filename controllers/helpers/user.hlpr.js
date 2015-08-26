'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
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


module.exports.update_referral = function(token, friend_list_id, friend_referred_by, friend_source) {
    var deferred = Q.defer();
    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        var referral_obj = {};
        var user_obj = {};

        referral_obj.friends = [ {
            source: friend_source,
            add_date: new Date(),
            phone: user.phone,
            email: user.email,
            user: user._id    
        } ]
            
        user_obj.friends = [ {
            source: friend_source,
            add_date: new Date(),
            phone: friend_referred_by.phone,
            email: friend_referred_by.email,
            user: friend_referred_by._id
        }]

        var referral_friends = new Friend(referral_obj);
        var user_friends = new Friend(user_obj);

        var update_referral = {
            $push: {
                friends: {
                    source: friend_source,
                    add_date: new Date(),
                    phone: user.phone,
                    email: user.email,
                    user: user._id
                }
            }
        }

        if(friend_list_id) {
            update_referral_friend(friend_list_id, update_referral).then(function(data) {
                save_user_freind(user_friends).then(function(data) {
                    User.findOneAndUpdate(
                        {_id: user._id}
                        ,{friends: data._id}, 
                        {upsert: true}, function(err, updated_user){
                            if(err || !updated_user ){
                                console.log(err)
                                deferred.reject({
                                    err: err || true,
                                    message: "Couldn\'t save referral"
                                });       
                            }
                            else{
                                console.log('here')
                                deferred.resolve({
                                    data: updated_user,
                                    message: 'Saved Referral'
                                });                                            
                            }   
                        }
                    )
                    
                }, function(err) {
                    deferred.reject({
                        err: err || true,
                        message: "Couldn\'t update user"
                    });
                });
            }, function(err) {
                deferred.reject({
                    err: err || true,
                    message: "Couldn\'t update user"
                });
                
            })
        }
        else{
            referral_friends.save(function(err, code) {
                if (err || !code) {
                  deferred.reject({
                    err: err || true,
                    message: 'Couldn\'t save referral '
                  });
                } 
                else {                    
                    User.findOneAndUpdate({
                        _id: friend_referred_by._id   
                    }, {'friends': code._id},
                        {upsert: true}, function(err, updated_referral_friend){
                        if(err || !updated_referral_friend ){
                            console.log(err)
                            deferred.reject({
                                err: err || true,
                                message: "Couldn\'t save referral"
                            });       
                        }
                        else{
                            save_user_freind(user_friends).then(function(data) {
                                User.findOneAndUpdate(
                                    {_id: user._id}
                                    ,{friends: data._id}, 
                                    {upsert: true}, function(err, updated_user){
                                        if(err || !updated_user ){
                                            console.log(err)
                                            deferred.reject({
                                                err: err || true,
                                                message: "Couldn\'t save referral"
                                            });       
                                        }
                                        else{
                                            deferred.resolve({
                                                data: updated_user,
                                                message: 'Saved Referral'
                                            });                                            
                                        }   
                                    }
                                )
                            }, function(err) {
                                deferred.reject({
                                    err: err || true,
                                    message: 'Couldn\'t save referral '
                                });
                                
                            })
                        }
                    })
                }
            });
        }
    }, function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t find user"
        });
    });

    return deferred.promise;
};

function update_referral_friend(id, referral) {
    logger.log();
    var deferred = Q.defer();
    Friend.findOneAndUpdate({
            _id: id
        }, 
        referral,
        function(err, u) {
        if (err || !u) {
            deferred.reject(err);
          
        } else {
            deferred.resolve(u);
        }
    });

    return deferred.promise;
}

function save_user_freind(user_friend) {
    logger.log();
    var deferred = Q.defer();
    user_friend.save(function(err, user) {
        if (err || !user) {
            deferred.reject(err); 
        }
        else{
            deferred.resolve(user);
        }
    })

    return deferred.promise;
}