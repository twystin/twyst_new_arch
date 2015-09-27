var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Event = mongoose.model('Event');
var RecoHelper = require('../helpers/reco.hlpr.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  if (!_.get(passed_data, 'event_data.event_outlet')) {
    deferred.reject('Follow outlet requires an outlet to be passed');
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
  var token = passed_data.token;

  Event.find({
    event_outlet: passed_data.event_data.event_outlet, event_type: 'follow'
    }, {}, 
    function(err, events){
      if(err){
        console.log(err);
        deferred.reject('Unable to process event');
      }
      else if(!events.length){
        User.findOneAndUpdate({
          _id: updated_user._id
          }, {
            $addToSet: {
              following: passed_data.event_data.event_outlet
            }
          },
          function(err, u) {
            if (err || !u) {
              deferred.reject('Could not update user');
            } else {
              RecoHelper.cache_user_favourites(updated_user).then(function(data) {
                deferred.resolve(passed_data);
              }, function(err) {
                deferred.reject('Could not update user cache')
              })
            }
          }
        );    
      }
      else{
        passed_data.already_followed = true;
        deferred.resolve(passed_data)
      }
    }
  )

  return deferred.promise;
};
