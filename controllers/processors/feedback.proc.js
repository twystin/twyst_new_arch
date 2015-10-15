var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var ImageUploader = require('../helpers/image.hlpr.js');

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
  data.event_data.event_meta.status = 'submitted';
  if(data && data.event_data && data.event_data.event_meta, data.event_data.event_meta.photo) {
    var img_obj = {
      user: data.user._id,
      event: data.event_data.event_type,
      image: data.event_data.event_meta.photo
    }

    ImageUploader.uploadAppImage(img_obj).then(function(res){
      data.event_data.event_meta.photo = res.data.path;      
      deferred.resolve(true);  
    },function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t submit feedback"
        });
        
    }) 
  }
  else{
    deferred.resolve(true);
  }
  
  return deferred.promise;
};