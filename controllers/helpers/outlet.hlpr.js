'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var AuthHelper = require('../../common/auth.hlpr.js');

module.exports.update_outlet = function(token, updated_outlet) {
  var deferred = Q.defer();
  var outlets = [];
  var id = updated_outlet._id;
  delete updated_outlet._id;
  delete updated_outlet.__v;

  AuthHelper.get_user(token).then(function(data) {
    outlets = (data.data.outlets && data.data.outlets.toString().split(',')) || null;
    if (_.includes(outlets, id)) {
      Outlet.findOneAndUpdate(
        {_id: id},
        {$set: updated_outlet},
        {upsert: true},
        function(err, o) {
          if (err || !o) {
            deferred.reject({err: err || true, message: 'Couldn\'t update the outlet'});
          } else {
            deferred.resolve({data: o, message: 'Updated outlet successfully'});
          }
        }
      );
    } else {
      deferred.reject({err: true, message: 'No permissions to update the outlet'});
    }
  }, function(err) {
    deferred.reject({err: err || true, message: 'Couldn\'t find the user'});
  });

  return deferred.promise;
};

module.exports.create_outlet = function(token, created_outlet) {
  var deferred = Q.defer();
  var outlet = null;
  AuthHelper.get_user(token).then(function(data) {
    outlet = new Outlet(created_outlet);
    outlet.save(function(err, o) {
      if (err || !o) {
        deferred.reject({err: err || true, message: 'Couldn\'t save the outlet.'});
      } else {
        User.findOne({_id: data.data._id}, function(err, user) {
          if (err || !user) {
            deferred.reject({err: err || true, message: 'Saved the outlet, but couldn\'t set the user.'});
          } else {
            user.outlets.push(o._id);
            user.save(function(err, u) {
              if (err || !u) {
                deferred.reject({err: err || true, message: 'Saved the outlet, but couldn\'t set the user.'});
              } else {
                deferred.resolve({data: o, message: 'Successfully created the outlet'});
              }
            });
          }
        });
      }
    });
  }, function(err) {
    deferred.reject({err: err || true, message: 'Couldn\'t find the user'});
  });

  return deferred.promise;
};
