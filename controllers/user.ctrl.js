'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');

module.exports.get = function(req, res) {
  console.log(req.params);
  if (req.params.id === '0') {
    AuthHelper.get_user(req.query.token).then(function(success) {
      HttpHelper.response({
        response: res,
        success_data: success,
        success_message: "Found user"
      });
    }, function(err) {
      HttpHelper.response({
        response: res,
        error: err,
        error_data: err,
        error_message: "Couldn't find user"
      });
    });
  } else {
    // HANDLE GET BY USER ID HERE!
    HttpHelper.response({
      response: res,
      error: true,
      error_data: null,
      error_message: "Not yet implemented"
    });
  }

};
