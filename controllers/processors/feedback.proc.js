var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var ImageUploader = require('../helpers/image.hlpr.js');
var Handlebars = require('handlebars');
var Transporter = require('../../transports/transporter.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  if (!_.get(passed_data, 'event_data.event_outlet')) {
    deferred.reject('Giving feedback requires an outlet to be passed');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();
  if(_.has(data, 'event_data.event_meta.photo')) {
    var img_obj = {
      user: data.user._id,
      event: data.event_data.event_type,
      image: data.event_data.event_meta.photo
    }

    ImageUploader.uploadAppImage(img_obj).then(function(res){
      data.event_data.event_meta.photo = res.data.path;
      var template = Handlebars.compile("{{#if email}}<b>Email: {{email}}</b><br />{{/if}}<b>Outlet: </b> {{event_outlet}}<br /><b>Offer: </b> {{event_meta.offer}}<br /><b>Issue: </b> {{event_meta.issue}}<br /><b>Comment: </b> {{event_meta.comment}}<br /><img src='{{event_meta.photo}}' style='max-width:100%;width:auto;height:auto;'>");
      var template_data = _.cloneDeep(data.event_data.event_meta);
      if(data.user && data.user.email) {
        template_data.email = data.user.email;
      }
      var payload = {
        from: 'contactus@twyst.in',
        to: 'contactus@twyst.in',
        subject: 'Feedback submitted by ' + data.user.phone,
        text: JSON.stringify(data.event_data),
        html: template(template_data)
      };
      Transporter.send('email', 'gmail', payload);

      deferred.resolve(true);  
    },function(err) {
      deferred.reject({
          err: err || true,
          message: "Couldn\'t upload bill"
      });
    });
  } else {
    var template = Handlebars.compile("{{#if email}}<b>Email: {{email}}</b><br />{{/if}}<b>Outlet: </b> {{event_outlet}}<br /><b>Offer: </b> {{event_meta.offer}}<br /><b>Issue: </b> {{event_meta.issue}}<br /><b>Comment: </b> {{event_meta.comment}}");
    var template_data = _.cloneDeep(data.event_data.event_meta);
    if(data.user && data.user.email) {
      template_data.email = data.user.email;
    }
    var payload = {
      from: 'contactus@twyst.in',
      to: 'contactus@twyst.in',
      subject: 'Feedback submitted by ' + data.user.phone + ' for ' + data.outlet.basics.name + ', ' + (data.outlet.contact.location.locality_1[0]?data.outlet.contact.location.locality_1[0] + ', ': '') + data.outlet.contact.location.locality_2[0],
      text: JSON.stringify(data.event_data),
      html: template(template_data)
    };
    Transporter.send('email', 'gmail', payload);
    deferred.resolve(true);
  }
  
};