'use strict';
/*jslint node: true */

var keygen = require('keygenerator');
var mongoose = require('mongoose');
require('../models/auth_token.mdl.js');
var AuthToken = mongoose.model('AuthToken');
var HttpHelper = require('../common/http.hlpr.js');

// Log the user in and generate an auth token which will be needed in every API call to authenticate the user
module.exports.login = function(req, res) {
  var token = keygen.session_id();
  var auth_token = new AuthToken({
    token: token,
    expiry: new Date(),
    account: req.user._id,
    user: req.user.user
  });

  auth_token.save(function(err) {
    HttpHelper.response({
      response: res,
      error: err,
      success_data: token,
      success_message: "Successfully logged in the user.",
      error_data: err,
      error_message: "Could not save the OAuth token. Try again."
    });
  });
};
