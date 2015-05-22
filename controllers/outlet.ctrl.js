'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');

module.exports.new = function(req, res) {
  var created_outlet = {};
  created_outlet = _.extend(created_outlet, req.body);
  var outlet = new Outlet(created_outlet);
  outlet.save(function(err) {
    HttpHelper.response({
      response: res,
      error: err,
      success_data: null,
      success_message: 'Successfully created the outlet',
      error_data: err,
      error_message: 'Error creating an outlet.'
    });
  });
};
