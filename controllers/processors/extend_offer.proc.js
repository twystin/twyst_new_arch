var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var AuthHelper = require('../../common/auth.hlpr.js');
var User = mongoose.model('User');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();

  check_for_offer_and_date(data)
  .then(function(data) {
    return check_enough_twyst_bucks(data);
  })
  .then(function(data) {
    deferred.resolve(data);
  })
  .fail(function(err) {
    deferred.reject(err);
  })
  
  return deferred.promise;
};

function check_for_offer_and_date(passed_data) {
    logger.log();
    var deferred = Q.defer();
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
}

function check_enough_twyst_bucks(passed_data){
    logger.log();
    var deferred = Q.defer();
    var available_twyst_bucks =  _.get(passed_data, 'user.twyst_bucks');

    if (available_twyst_bucks < 150) {
        deferred.reject('Not enough twyst bucks');
    } 
    else {
        deferred.resolve(passed_data);
    } 
    return deferred.promise;
}
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
        console.log(err);
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
