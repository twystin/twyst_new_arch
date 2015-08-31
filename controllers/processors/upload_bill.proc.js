var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var ImageUploader = require('./helpers/image.hlpr.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var bill_date = _.get(passed_data, 'event_data.event_meta.bill_date');
  var photo = _.get(passed_data, 'event_data.event_meta.photo');
  var outlet_name = _.get(passed_data, 'event_data.event_meta.outlet_name');
  var outlet = _.get(passed_data, 'event_data.event_outlet');

  if (!bill_date || !photo || !outlet_name) {
    deferred.reject('Submit bill needs to have bill date, photo & outlet name.');
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
  var deferred = Q.defer();
  
  
  var img_obj = {
    bucketName: 'retwyst',
    image: data.event_data.event_meta.photo
  }

  ImageUploader.uploadImage(img_obj).then(function(data){
    deferred.resolve(true);  
  },function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t upload bill"
        });
        
    })

  return deferred.promise;
};
