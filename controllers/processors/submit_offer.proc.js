var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var ImageUploader = require('../helpers/image.hlpr.js');

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
  
  data.event_data.event_meta.status = 'submitted';
  if(data && data.event_data && data.event_data.event_meta, data.event_data.event_meta.photo) {
    var img_obj = {
      user: data.user._id,
      event: data.event_data.event_type,
      image: data.event_data.event_meta.photo
    }

    ImageUploader.uploadAppImage(img_obj).then(function(data){
      deferred.resolve(true);  
    },function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t upload bill"
        });
        
    }) 
  }
  

  return deferred.promise;
};
