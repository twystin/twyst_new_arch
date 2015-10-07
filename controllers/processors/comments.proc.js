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
  var template = Handlebars.compile("<b>Comments: </b> {{comments}}<br />");
    
    var payload = {
      from: 'contactus@twyst.in',
      to: 'contactus@twyst.in',
      subject: 'Message for Twyst from ' + data.user.phone,
      text: JSON.stringify(data.event_data),
      html: template(data.event_data.event_meta)
    };
    Transporter.send('email', 'gmail', payload);
  return deferred.promise;
};
