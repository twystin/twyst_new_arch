'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var OutletHelper = require('./helpers/outlet.hlpr.js');

var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');

module.exports.new = function(req, res) {
  var token = req.query.token || null;
  var created_outlet = {};

  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  created_outlet = _.extend(created_outlet, req.body);
  OutletHelper.create_outlet(token, created_outlet).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.update = function(req, res) {
  var token = req.query.token || null;
  var updated_outlet = {};
  updated_outlet = _.extend(updated_outlet, req.body);

  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  OutletHelper.update_outlet(token, updated_outlet).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.get = function(req, res) {
  if (!req.params.outlet_id) {
    HttpHelper.error(res, true, "No outlet id passed");
  }

  OutletHelper.get_outlet(req.params.outlet_id).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.all = function(req, res) {
  var token = req.query.token || null;
  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  OutletHelper.get_all_outlets(token).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

module.exports.remove = function(req, res) {
  var token = req.query.token || null;
  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  if (!req.params.outlet_id) {
    HttpHelper.error(res, true, "No outlet id passed");
  }

  OutletHelper.remove_outlet(token, req.params.outlet_id).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};
