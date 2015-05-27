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
    User.findOneAndUpdate(
      {_id: user._id},
      {$set: updated_user},
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
