'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var UserHelper = require('./helpers/user.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');

module.exports.get_coupons = function(req, res) {
  var token = req.query.token || null;

  if (!token) {
    HttpHelper.error(res, null, "Not authenticated");
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
    HttpHelper.error(res, null, "Not authenticated");
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
    HttpHelper.error(res, null, "Not authenticated");
  }

  var updated_user = {};
  updated_user = _.extend(updated_user, req.body);

  UserHelper.update_user(token, updated_user).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.err, err.message);
  });
};
