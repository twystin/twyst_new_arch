var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var ImageUploader = require('../helpers/image.hlpr.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var photo = _.get(passed_data, 'event_data.event_meta.photo');
  var outlet_name = _.get(passed_data, 'event_data.event_meta.outlet_name');
  var outlet = _.get(passed_data, 'event_data.event_outlet');

  if (!photo || !outlet_name) {
    deferred.reject('Submit bill needs to have bill photo & outlet name.');
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

  ImageUploader.uploadAppImage(img_obj).then(function(res){
    data.event_data.event_meta.photo = res.data.path;
    data.event_data.event_meta.status = 'submitted';
    data.event_data.event_meta.phone = data.user.phone;
    data.event_data.event_meta.email = data.user.email;
    deferred.resolve(true);  
  },function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t upload bill"
        });
        
    })

  return deferred.promise;
};
