'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var Friend = mongoose.model('Friend');
var AuthHelper = require('../../common/auth.hlpr.js');
var async = require('async');
var logger = require('tracer').colorConsole();


module.exports.update_user = function(token, updated_user) {
  var deferred = Q.defer();

  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    user = _.extend(user, updated_user);
    
    if(user.gcmId) {
        var push_info = {
            push_type: 'gcm',
            push_id: user.gcmId,
            push_meta: {} 
            
        };   
        user.push_ids.push(push_info);
    }
    if(user.lat && user.long) {
        user.locations = {};
        user.locations.coords ={};
        user.locations.coords.lat = user.lat;
        user.locations.coords.log = user.long;
        user.locations.when = new Date();
    }
    
    user.device_info = {
        id: user.device,
        os: user.os_version,
        model: user.model    
    }  

    delete user.os_version;
    delete user.model;
    delete user.gcmId;
    delete user.lat;
    delete user.long;

    
    User.findOneAndUpdate({
      _id: user._id
    }, {
      $set: user
    }, {
      upsert: false,
      overwrite: true
    }).exec(function(err, u) {
      if (err || !u) {
        console.log(err);
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
        async.each(friend_list.list, function(friend){
            var update_phone_user = {
                $addToSet: {
                    friends: {
                        source: 'phonebook',
                        add_date: new Date(),
                        phone: user.phone,
                        email: user.email,
                        user: user._id,
                        name: user.name
                    }
                }
            }
            var update_referral = {
                $addToSet: {
                    friends: {
                        source: 'phonebook',
                        add_date: new Date(),
                        phone: friend.phone,
                        name: friend.name
                    }
                }   
            }

            User.findOne({phone: friend.phone}, {}, function(err, phone_user){
                if(err || ! phone_user) {
                    if(user.friends){

                        update_user_friend(user.friends, update_referral).then(function(data){
                            deferred.resolve({
                                data: user,
                                message: 'Saved Referral'
                            });   
                        },function(err) {
                            deferred.reject({
                                err: err || true,
                                message: "Couldn\'t update user"
                            });
                        });
                    }
                    
                }
                else if(phone_user.friends)   {
                    update_user_friend(phone_user.friends, update_phone_user).then(function(data){
                        if(user.friends) {

                            update_user_friend(user.friends, update_user).then(function(data){
                                deferred.resolve({
                                    data: user,
                                    message: 'Saved Referral'
                                });
                            }, function(err) {
                                deferred.reject({
                                    err: err || true,
                                    message: "Couldn\'t update user"
                                });
                            });
                        }
                        
                    }, function(err) {
                        deferred.reject({
                            err: err || true,
                            message: "Couldn\'t update phone user"
                        });
                    });
                   
                }
                
            })        
        }, function(err){            
            if( err ) {
                deferred.reject({
                    err: err || true,
                    message: "Couldn\'t update phone user"
                });
            } 
            else {
                deferred.resolve({
                    data: user,
                    message: 'Saved Referral'
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

function update_user_friend(id, referral) {
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
