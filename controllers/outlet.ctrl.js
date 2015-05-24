'use strict';
/*jslint node: true */

var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');

module.exports.new = function(req, res) {
  var token = req.query.token || null;
  var created_outlet = {};
  var outlet = null;
  AuthHelper.token_check(token, res);
  AuthHelper.get_user(token).then(function(data) {
    created_outlet = _.extend(created_outlet, req.body);
    outlet = new Outlet(created_outlet);
    outlet.save(function(err, o) {
      if (err || !o) {
        HttpHelper.error(res, err, 'Couldn\'t save the outlet.');
      } else {
        User.findOne({_id: data.data._id}, function(err, user) {
          if (err || !user) {
            HttpHelper.error(res, err, 'Saved the outlet, but couldn\'t set the user.');
          } else {
            user.outlets.push(o._id);
            user.save(function(err, u) {
              if (err || !u) {
                HttpHelper.error(res, err, 'Saved the outlet, but couldn\'t set the user.');
              } else {
                HttpHelper.success(res, o, 'Successfully created the outlet');
              }
            });
          }
        });
      }
    });
  });
};
