var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
var RecoHelper = require('../helpers/reco.hlpr.js');
var Outlet = mongoose.model('Outlet');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var outlet = _.get(passed_data, 'event_data.event_meta.outlet');

  if (!offer || !outlet) {
    deferred.reject('Unlike offer information needs to have offer & outlet.');
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
  Outlet.findOneAndUpdate({
      _id: passed_data.event_data.event_meta.outlet,
      offers: {
        $elemMatch: {
          '_id': passed_data.event_data.event_meta.offer
        }
      }
    }, {
      $pull: {
        'offers.$.offer_likes': updated_user._id
      }
    },
    function(err, updated_outlet) {
      if (err || !updated_outlet) {
        console.log(err);
        deferred.reject('Could not update offer');
      } else {
        RecoHelper.cache_offer_likes(passed_data.event_data.event_type, passed_data.event_data.event_meta.offer, updated_user._id, updated_outlet._id).then(function(data) {
          deferred.resolve(passed_data);
        }, function(err) {
          deferred.reject('Could not update outlet cache');
        });
      }
    });

  return deferred.promise;
};