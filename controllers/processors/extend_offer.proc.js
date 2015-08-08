var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var AuthHelper = require('../../common/auth.hlpr.js');
var User = mongoose.model('User');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var date = _.get(passed_data, 'event_data.event_meta.date');
  
  date = new Date(date);

  if (!offer || !date) {
    deferred.reject('Extend offer requires offer and date to be passed');
  } 
  else if (date.getTime() < (new Date().getTime())) {
    deferred.reject("You can not extend to past date");
  }
  else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    var user_id = data.user._id;
    var offer = data.event_data.event_meta.offer;
    var new_date = data.event_data.event_meta.date;
    new_date = new Date(new_date);

    User.findOneAndUpdate({
      _id: user_id,
      coupons: {
        $elemMatch: {
          _id: offer
        }
      }
    }, {
      $set: {
        'coupons.$.lapse_date': new_date
      }
    },
    function(err, u) {
      if (err || !u) {
        console.log(err)
        deferred.reject({
          err: err || true,
          message: "Couldn\'t  extend voucher validity"
        });
      } else {
        deferred.resolve({
          data: u,
          message: 'Updated user'
        });
      }
    }
  );
    
    return deferred.promise;
  };
