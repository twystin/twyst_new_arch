'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var ld = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var Friend = mongoose.model('Friend');
var AuthHelper = require('../../common/auth.hlpr.js');
var async = require('async');
var logger = require('tracer').colorConsole();


module.exports.update_user = function(token, updated_user) {
  logger.log();
  var deferred = Q.defer();
  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    console.log(updated_user);
    user = ld.merge(user, updated_user);
    
    if(user.gcmId) {
        var index = ld.findIndex(user.push_ids, function(push) { return push.push_id==gcmId; });
        if(index==-1) {
          var push_info = {
              push_type: 'gcm',
              push_id: user.gcmId,
              push_meta: {} 
              
          };   
          user.push_ids.push(push_info);
        }
    }
    if(user.lat && user.long) {
        user.locations = {};
        user.locations.coords ={};
        user.locations.coords.lat = user.lat;
        user.locations.coords.log = user.long;
        user.locations.when = new Date();
    }

    if(user.source) {
      user[updated_user.source.toLowerCase()] = updated_user;
    }
    
    user.device_info = {
        id: user.device,
        os: user.os_version,
        model: user.model    
    }  
    user.friends = user.friends_id;

    delete user.os_version;
    delete user.model;
    delete user.gcmId;
    delete user.lat;
    delete user.long;
    delete user.__v;
    delete user.friends._id;

    User.findOneAndUpdate({
      _id: user._id
    }, {
      $set: user
    }, {
      upsert: true
    }).exec(function(err, u) {
      if (err || !u) {
        console.log(err);
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
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: "Couldn\'t find user"
    });
  });

  return deferred.promise;
};

module.exports.update_friends = function(token, friend_list) {
    logger.log();
    var deferred = Q.defer();
    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        var update_query = { $pushAll: { friends: [] } };
        async.each(friend_list.list, function(friend, callback) {
            var index;
            if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {
                index = _.findIndex(user.friends, function(existing_friend) { return existing_friend.social_id == friend.id; });
            } 
            else {
                index = _.findIndex(user.friends, function(existing_friend) { return existing_friend.phone == friend.phone; });
            }
            if (index === -1) {
                var friend_obj = { 
                    source: friend_list.source, 
                    add_date: new Date(), 
                    phone: '', 
                    social_id: '', 
                    name: friend.name, 
                    email: friend.email 
                };

                var user_obj = { 
                    source: friend_list.source, 
                    add_date: new Date(),
                    phone: user.phone, 
                    social_id: '',
                    email: user.email, 
                    user: user._id, 
                    name: user.first_name 
                };
        
                if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {
                    friend_obj.social_id = friend.id;

                    findFriendBySourceId(friend.id).then(function(app_friend) {
                        if (app_friend) {
                            friend_obj.user = app_friend.id;
                            friend_obj.email = app_friend.email;
                            friend_obj.phone = app_friend.phone;
                            addUserReferral(user_obj, app_friend.friends);
                        }
                        update_query['$pushAll'].friends.push(friend_obj);
                        callback();
                    })

                }
                else {
                    friend_obj.phone = friend.phone;

                    findFriendBySourceId(friend.phone).then(function(app_friend) {
                        if (app_friend) {
                            friend_obj.user = app_friend.id;
                            friend_obj.email = app_friend.email;
                            addUserReferral(user_obj, app_friend.friends);
                        }
                        update_query['$pushAll'].friends.push(friend_obj);
                        callback();
                    })

                }
            } 
            else {
                callback();
            }
        }, 
        function() {
            console.log(update_query)
            Friend.findOneAndUpdate({'_id': user.friends_id}, update_query, function(err, u) {
                if (err || !u) {
                    deferred.reject({
                        err: err || true,
                        message: "Couldn\'t update user"
                    });
                } 
                else {
                   // console.log(u)
                    deferred.resolve({
                        data: u,
                        message: 'Updated user'
                    });
                }
            });
        }
    )}, function(err) {
        deferred.reject({
          err: err || true,
          message: "Couldn\'t find user"
        });
    });

    return deferred.promise;
};

function findFriendBySourceId(friendId) {
  logger.log();
  var deferred = Q.defer();
  User.findOne({ $or: [{ 'facebook.id': friendId }, { 'google.id': friendId }, {phone: friendId}] }).exec(function(err, friend) {
    if (err || !friend) {
      deferred.resolve();
    } else {
      deferred.resolve({
        id: friend._id.toString(),
        email: friend.email,
        phone: friend.phone,
        friends: friend.friends
      });
    }
  });
  return deferred.promise;
}



function addUserReferral(user_obj, friendObjId) {
    logger.log();
    Friend.findOne({'_id': ObjectId(friendObjId)}).exec(function(err, obj) {
        if(err || !obj) {

        }
        else {
            var index = _.findIndex(obj.friends, function(friend) { 
                return friend.phone == user_obj.phone; 
            });
            if(index == -1) {
                obj.friends.push(user_obj);
            } 
            else {
                obj.friends[index].user = user_obj.user.toString();
            }
            obj.save(function(err) { 
                if(err) { 
                    logger.error(err); 
                } 
                else { 
                    logger.log('referral added successfully'); 
                }
            });
        }
    });
}