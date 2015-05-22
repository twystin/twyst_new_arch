'use strict';
/*jslint node: true */

var Q = require('q');

var mongoose = require('mongoose');
require('../models/auth_token.mdl.js');
var AuthToken = mongoose.model('AuthToken');

module.exports.validate_token = function(t) {
  var deferred = Q.defer();
  AuthToken.findOne({'token': t}, function(err, token) {
    if(token) {
      deferred.resolve(token);
    } else {
      deferred.reject(null);
    }
  });
  return deferred.promise;
};
