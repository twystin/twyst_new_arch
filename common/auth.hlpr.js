'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');

var mongoose = require('mongoose');
var HttpHelper = require('./http.hlpr');
require('../models/auth_token.mdl.js');
require('../models/user.mdl.js');

var AuthToken = mongoose.model('AuthToken');
var User = mongoose.model('User');

module.exports.get_user = function(token) {
  var deferred = Q.defer();
  AuthToken.findOne({
    'token': token
  }, function(err, found_token) {
    if (err) {
      deferred.reject({
        response: false,
        message: 'Token not found',
        data: null
      });
    }

    if (found_token) {
      User.findOne({
        '_id': found_token.user
      }, function(err, user) {
        if (err) {
          deferred.reject({
            response: false,
            message: 'User not found',
            data: null
          });
        }

        if (user) {
          deferred.resolve({
            response: true,
            message: 'User found',
            data: user
          });
        } else {
          deferred.reject({
            response: false,
            message: 'User not found',
            data: null
          });
        }
      });
    } else {
      deferred.reject({
        response: false,
        message: 'Token not found',
        data: null
      });
    }
  });
  return deferred.promise;
};

module.exports.validate_token = function(t) {
  var deferred = Q.defer();
  AuthToken.findOne({
    'token': t
  }, function(err, token) {
    if (token) {
      deferred.resolve(token);
    } else {
      deferred.reject(null);
    }
  });
  return deferred.promise;
};

module.exports.have_permission = function(token, perm) {
  var deferred = Q.defer();
  AuthToken.findOne({
    'token': token
  }, function(err, token) {
    if (err) {
      deferred.reject({
        response: false,
        message: 'Token not found',
        data: null
      });
    }

    if (token) {
      User.findOne({
        '_id': token.user
      }, function(err, user) {
        if (err) {
          deferred.reject({
            response: false,
            message: 'User not found',
            data: null
          });
        }

        if (user) {
          if (user.activities) {
            var found = _.find(user.activities, function(a) {
              return a === perm;
            });
            if (found) {
              deferred.resolve({
                response: true,
                message: 'Permission granted',
                data: null
              });
            } else {
              deferred.reject({
                response: false,
                message: 'No permission for this activity',
                data: null
              });
            }
          } else {
            deferred.reject({
              response: false,
              message: 'No permission for this activity',
              data: null
            });
          }
        } else {
          deferred.reject({
            response: false,
            message: 'User not found',
            data: null
          });
        }
      });
    } else {
      deferred.reject({
        response: false,
        message: 'Token not found',
        data: null
      });
    }
  });
  return deferred.promise;
};
