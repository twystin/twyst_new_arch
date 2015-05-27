'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
require('../models/event.mdl.js');
var Event = mongoose.model('Event');
var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var _ = require('underscore');

var Q = require('q');

module.exports.new = function(req, res) {
  var token = req.query.token || null;
  var created_event = {};

  if (!token) {
    HttpHelper.error(res, true, "Not authenticated");
  }

  created_event = _.extend(created_event, req.body);
  create_event(token, created_event).then(function(data) {
    HttpHelper.success(res, data.data, data.message);
  }, function(err) {
    HttpHelper.error(res, err.data, err.message);
  });
};

var create_event = function(token, created_event) {
  var deferred = Q.defer();
  var event = null;
  AuthHelper.get_user(token).then(function(data) {
    event = new Event(created_event);
    event.save(function(err, e) {
      if (err || !e) {
        deferred.reject({err: err || true, message: 'Couldn\'t save the event.'});
      } else {
          deferred.resolve({data: e, message: 'Successfully created the event'});
      }
    });
  }, function(err) {
    deferred.reject({err: err || true, message: 'Couldn\'t find the user'});
  });

  return deferred.promise;
};
