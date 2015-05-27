'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.get_coupons = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  AuthHelper.get_user(req.query.token).then(function(data) {
    HttpHelper.success(res, data.data.coupons, 'Returning users coupons');
  }, function(err) {
    HttpHelper.error(res, err, 'Couldn\'t find the user');
  });
};

module.exports.get_profile = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  AuthHelper.get_user(req.query.token).then(function(data) {
    HttpHelper.success(res, data, "Found user");
  }, function(err) {
    HttpHelper.error(res, err, "Could not find user");
  });
};

module.exports.update_profile = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  AuthHelper.get_user(req.query.token).then(function(data) {
    var user = data.data;
    var updated_user = {};
    updated_user = _.extend(updated_user, req.body);

    User.findOneAndUpdate(
      {_id: user._id},
      {$set: updated_user},
      {upser: true},
      function(err, u) {
        if (err || !u) {
          HttpHelper.error(res, err || true, "Couldn\'t update user");
        } else {
          HttpHelper.success(res, u, 'Updated user');
        }
      }
    );
  }, function(err) {
    HttpHelper.error(res, err, "Could not find user");
  });

};
