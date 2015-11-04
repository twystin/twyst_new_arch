var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Handlebars = require('handlebars');
var Transporter = require('../../transports/transporter.js');

var mongoose = require('mongoose');
var RecoHelper = require('../helpers/reco.hlpr.js');
var Outlet = mongoose.model('Outlet');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var outlet = _.get(passed_data, 'event_data.event_outlet');
  var issue = _.get(passed_data, 'event_data.event_meta.issue');
  var comment = _.get(passed_data, 'event_data.event_meta.comment');

  if (!offer || !outlet) {
    deferred.reject('Report Problem information needs to have offer & outlet.');
  }
  else if(!issue && !comment){
    deferred.reject('Report Problem information needs to select issue or should write a comment');
  }
  else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};
module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();
  data.event_data.event_meta.status = 'submitted';
  data.event_data.event_meta.phone = data.user.phone;
  data.event_data.event_meta.email = data.user.email;
  deferred.resolve(true);
  return deferred.promise;
};