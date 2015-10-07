var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Handlebars = require('handlebars');
var Transporter = require('../../transports/transporter.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var comments = _.get(passed_data, 'event_data.event_meta.comments');
    
  if (!comments) {
    deferred.reject('Write to twyst needs comments.');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  var deferred = Q.defer();
  deferred.resolve(true);
  var template = Handlebars.compile("{{#if email}}<b>Email: {{email}}</b><br />{{/if}}<b>Comments: </b> {{comments}}<br />");
    var template_data = _.cloneDeep(data.event_data.event_meta);
    if(data.user && data.user.email) {
      template_data.email = data.user.email;
    }
    var payload = {
      from: 'contactus@twyst.in',
      to: 'rc@twyst.in',
      cc: 'kuldeep@twyst.in, hemant@twyst.in',
      subject: 'Message for Twyst from ' + data.user.phone,
      text: JSON.stringify(data.event_data),
      html: template(template_data)
    };
    Transporter.send('email', 'gmail', payload);
  return deferred.promise;
};
