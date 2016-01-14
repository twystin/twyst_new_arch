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
var Contact = mongoose.model('Contact');
var Order = mongoose.model('Order');
var AuthHelper = require('../../common/auth.hlpr.js');
var async = require('async');
var logger = require('tracer').colorConsole();


module.exports.update_user = function(token, updated_user) {
  logger.log();
  var deferred = Q.defer();
  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    user = ld.merge(user, updated_user);
    
    if(user.gcmId) {
        var index = ld.findIndex(user.push_ids, function(push) { return push.push_id==user.gcmId; });
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
        var obj = {};
        var friend = [];
        _.each(friend_list.list, function(user_friend){
            if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {
            
            obj.social_id = friend.id;
            obj.email = user_friend.email;
            obj.phone = user_friend.phone;
            obj.name = user_friend.name;
            obj.add_date = new Date();
        
            }
            else {

                obj.phone = user_friend.phone;
                obj.name = user_friend.name;
                obj.add_date = new Date();

            }    
            friend.push(obj);
        })
        var contact = new Contact();
        contact.friends = friend;
        contact.user = user._id;
        contact.save(function(err) { 
            if(err) { 
                logger.error(err); 
                deferred.reject({
                        data: err,
                        message: 'error in updating user'
                    });
            } 
            else { 
                deferred.resolve({
                    data: user,
                    message: 'Updated user'
                });
            }
        });
        //var update_query = { $pushAll: { friends: [] } };
        /*async.each(friend_list.list, function(friend, callback) {
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
                    name: user.first_name,
                    gcm_id: user.push_ids[user.push_ids.length - 1].push_id
                };
        
                if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {
                    friend_obj.social_id = friend.id;

                    findFriendBySourceId(friend.id).then(function(app_friend) {
                        if (app_friend) {
                            friend_obj.user = app_friend.id;
                            friend_obj.email = app_friend.email;
                            friend_obj.phone = app_friend.phone;
                            addUserReferral(user_obj, app_friend.friends);
                            friend_obj.gcm_id = app_friend.gcm_id;
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
                            friend_obj.gcm_id = app_friend.gcm_id;
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
            Friend.findOneAndUpdate({'_id': user.friends_id}, update_query, function(err, u) {
                if (err || !u) {
                    deferred.reject({
                        err: err || true,
                        message: "Couldn\'t update user"
                    });
                } 
                else {
                    deferred.resolve({
                        data: u,
                        message: 'Updated user'
                    });
                }
            });
        }*/
    }, function(err) {
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
      var push_id = null;
      if(friend.push_ids.length) {
        push_id = friend.push_ids[friend.push_ids.length - 1].push_id
      } else {
        push_id = '';
      }
      deferred.resolve({
        id: friend._id.toString(),
        email: friend.email,
        phone: friend.phone,
        friends: friend.friends,
        gcm_id: push_id
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

module.exports.get_orders = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;

        Order.find({user: user._id }).populate('outlet').exec(function(err, orders) {
            if (err || !user) {
              deferred.reject();
            } 
            else {                
                orders = _.map(orders, function(order){
                    var updated_order = {};    
                    updated_order.outlet_name = order.outlet.basics.name;
                    updated_order.items = order.items;
                    updated_order.address = order.address;
                    updated_order.is_favourite = order.is_favourite;
                    if(order.offer_used) {
                        updated_order.order_cost = order.order_value_with_offer + order.tax_paid;
                    }
                    else{
                        updated_order.order_cost = order.order_value_without_offer + order.tax_paid;
                    }
                    updated_order.cashback = order.cashback;
                    updated_order.order_date = order.order_date;
                    updated_order.order_status = order.order_status;
                    return updated_order;
                })
                deferred.resolve({
                    data: orders,
                    message: 'found user orders'
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

module.exports.cancel_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
      
        Order.findOneAndUpdate({
            _id: order.id
          }, {
            $set: {order_status: 'cancelled', cancel_reason: order.reason}
          }, {
            upsert: true
          },
          function(err, o) {
            if (err || !o) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t cancel the order'
              });
            } else {
              updated_outlet._id = id;

              deferred.resolve({
                data: o,
                message: 'order cancelled successfully'
              });
            }
          }
        );
    }, function(err) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t find the user'
        });
    });
    return deferred.promise;
};