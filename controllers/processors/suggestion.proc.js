var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Handlebars = require('handlebars');
var Transporter = require('../../transports/transporter.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var outlet = _.get(passed_data, 'event_data.event_meta.outlet');
  var location = _.get(passed_data, 'event_data.event_meta.location');

  if (!outlet || !location) {
    deferred.reject('Suggestion needs to have outlet & location.');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  var deferred = Q.defer();

  var template = Handlebars.compile("{{#if email}}<b>Email: {{email}}</b><br />{{/if}}<b>Outlet: </b> {{outlet}}<br /><b>Location: </b> {{location}}<br /><b>Comment: </b> {{comment}}")
  var template_data = _.cloneDeep(data.event_data.event_meta);
  if(data.user && data.user.email) {
    template_data.email = data.user.email;
  }
  var payload = {
    from: 'contactus@twyst.in',
    to: 'contactus@twyst.in',
    subject: 'New suggesstion from ' + data.user.phone,
    text: JSON.stringify(data.event_data),
    html: template(template_data)
  };
  Transporter.send('email', 'gmail', payload);
  deferred.resolve(true);
  return deferred.promise;
};
