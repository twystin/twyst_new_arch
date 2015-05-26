'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');

module.exports.get = function(req, res) {
  Outlet.find({}, function(err, outlets) {
    HttpHelper.success(res, err || false, outlets);
  });
};
