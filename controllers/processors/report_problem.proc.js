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
  var deferred = Q.defer();

  var template = Handlebars.compile("{{#if email}}<b>Email: {{email}}</b><br />{{/if}}<b>Outlet: </b> {{event_outlet}}<br /><b>Offer: </b> {{event_meta.offer}}<br /><b>Issue: </b> {{event_meta.issue}}<br /><b>Comment: </b> {{event_meta.comment}}");
  var template_data = _.cloneDeep(data.event_data.event_meta);
  if(data.user && data.user.email) {
    template_data.email = data.user.email;
  }
  var payload = {
    from: 'contactus@twyst.in',
    to: 'contactus@twyst.in',
    subject: 'Issue in offer for ' + data.user.phone,
    text: JSON.stringify(data.event_data),
    html: template(template_data)
  };
  Transporter.send('email', 'gmail', payload);

  deferred.resolve(true);
  return deferred.promise;
};