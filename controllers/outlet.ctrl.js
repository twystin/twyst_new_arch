'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');
var HttpHelper = require('../common/http.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');

module.exports.new = function(req,res) {
  AuthHelper.validate_token(req.query.token).then(function(success) {
    // SAVE THE OUTLET HERE
    var created_outlet = {};
  	created_outlet = _.extend(created_outlet, req.body);
  	var outlet = new Outlet(created_outlet);
    console.log(outlet);
  	outlet.save(function(err) {
  		if (err) {
  			res.send(200, {	'status': 'error',
  						'message': 'Outlet creation error. Please fill all required fields',
  						'info': JSON.stringify(err)
  			});
  		} else {
  			res.send(200, {	'status': 'success',
  						'message': 'Saved outlet',
  						'info': ''
  			});
  		}
  	});

  }, function(err) {
    HttpHelper.response({
      response: res,
      error: err,
      error_data: err,
      error_message: "Could not authenticate the user."
    });
  });
};
