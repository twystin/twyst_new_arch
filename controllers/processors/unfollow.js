var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var RecoHelper = require('../helpers/reco.hlpr.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  if (!_.get(passed_data, 'event_data.event_outlet')) {
    deferred.reject('Unfollowing an outlet requires an outlet to be passed');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();

  var deferred = Q.defer();
  var passed_data = data;
  var updated_user = passed_data.user;

  User.findOneAndUpdate({
      _id: updated_user._id
    }, {
      $pull: {
        following: passed_data.event_data.event_outlet
      }
    },
    function(err, u) {
      if (err) {
        deferred.reject('Could not update user');
      } else {
        RecoHelper.cache_user_favourites(updated_user).then(function(data) {
          deferred.resolve(passed_data);
        }, function(err) {
          deferred.reject('Could not update user cache');
        });
      }
    });

  return deferred.promise;
};
