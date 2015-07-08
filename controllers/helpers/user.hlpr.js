'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var AuthHelper = require('../../common/auth.hlpr.js');


module.exports.update_user = function(token, updated_user) {
  var deferred = Q.defer();

  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    user = _.extend(user, updated_user);
    console.log(user);
    User.findOneAndUpdate(
      {_id: user._id},
      {$set: user},
      {
        upsert: false,
        overwrite: true
      }).exec(function(err, u) {
        console.log(err);
        if (err || !u) {
          deferred.reject({err: err || true, message: "Couldn\'t update user"});
        } else {
          deferred.resolve({data: u, message: 'Updated user'});
        }
      }
    );
  }, function(err) {
    deferred.reject({err: err || true, message: "Couldn\'t find user"});
  });

  return deferred.promise;
};

module.exports.update_friends = function(token, friend_list) {
  var deferred = Q.defer();

  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    User.findOneAndUpdate(
      {_id: user._id},
      {$set: {
        friend_source: friend_list.source,
        friend_list: friend_list.list
      }},
      {upser: true},
      function(err, u) {
        if (err || !u) {
          deferred.reject({err: err || true, message: "Couldn\'t update user"});
        } else {
          deferred.resolve({data: u, message: 'Updated user'});
        }
      }
    );
  }, function(err) {
    deferred.reject({err: err || true, message: "Couldn\'t find user"});
  });

  return deferred.promise;
};
