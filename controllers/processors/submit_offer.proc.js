var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Handlebars = require('handlebars');
var ImageUploader = require('../helpers/image.hlpr.js');
var Transporter = require('../../transports/transporter.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var outlet = _.get(passed_data, 'event_data.event_meta.outlet');
  var location = _.get(passed_data, 'event_data.event_meta.location');

  if (!offer || !outlet || !location) {
    deferred.reject('Submit offer information needs to have offer, outlet & location.');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();
  var img_obj = {
    user: data.user._id,
    event: data.event_data.event_type,
    image: data.event_data.event_meta.photo
  }

  var template = Handlebars.compile("{{#if email}}<b>Email: {{email}}</b><br />{{/if}}<b>Outlet: </b> {{outlet}}<br /><b>Offer: </b> {{offer}}<br /><b>Photo: </b> <img src='{{photo}}' style='max-width:100%;height:auto;width:auto;'>")
  var template_data = _.cloneDeep(data.event_data.event_meta);
  if(data.user && data.user.email) {
    template_data.email = data.user.email;
  }
  var payload = {
    from: 'contactus@twyst.in',
    to: 'contactus@twyst.in',
    subject: 'New offer submitted by ' + data.user.phone + ' for ' + data.event_data.event_meta.outlet,
    text: JSON.stringify(data.event_data),
    html: template(template_data)
  };

  Transporter.send('email', 'gmail', payload);

  ImageUploader.uploadAppImage(img_obj).then(function(data){
    deferred.resolve(true);  
  },function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t upload bill"
        });
        
    })
  deferred.resolve(true);
  return deferred.promise;
};
