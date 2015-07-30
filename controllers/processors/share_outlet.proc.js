var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  if (!_.get(passed_data, 'event_data.event_outlet')) {
    deferred.reject('Sharing an outlet requires an outlet to be passed');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  var deferred = Q.defer();
  deferred.resolve(true);

  var passed_data = data;
  var updated_user = passed_data.user;
  var shared_offer = {};

  shared_offer.event_type = passed_data.event_data.event_type;
  shared_offer.event_target = passed_data.event_data.event_outlet;

  User.findOneAndUpdate({
      _id: updated_user
    }, {
      $addToSet: {
        'user_meta.total_events': shared_offer
      }
    },
    function(err, updated_user) {
      if (err) {
        console.log(err);
        deferred.reject('Could not update user');
      } else {
        deferred.resolve(passed_data);
      }
    });
  return deferred.promise;
};
