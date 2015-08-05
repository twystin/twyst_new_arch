var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
require('../../models/qr_code.mdl');
require('../../models/event.mdl');
require('../../models/user.mdl');
var QR = mongoose.model('QR');
var Event = mongoose.model('Event');
var User = mongoose.model('User');


module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();

  check_coupon_code(data)
    .then(function(data) {
      return check_user_has_coupon(data);
    })
    .then(function(data) {
      return check_coupon_valid(data);
    })
    .then(function(data) {
      deferred.resolve(data);
    })
    .fail(function(err) {
      deferred.reject(err);
    })
  return deferred.promise;
};

function check_coupon_code(data) {
  logger.log();
  var deferred = Q.defer();

  if (!_.has(data, 'event_data.event_meta.coupon')) {
    deferred.reject('No coupon code sent to redeem');
  }

  deferred.resolve(data);
  return deferred.promise;
}

function check_user_has_coupon(data) {
  logger.log();
  var deferred = Q.defer();
  var code = _.get(data, 'event_data.event_meta.coupon');
  User.findOne({
    _id: data.user._id,
  }, function(err, u) {
    var coupons = u.coupons;
    var coupon = (_.filter(coupons, {code:code}))[0]; // TODO: _.find didnt work here, find out why
    logger.log(coupon);
    if (!coupon) {
      deferred.reject('Could not find this coupon for the user');
    } else {
      var passed_data = data;
      passed_data.coupon = coupon;
      deferred.resolve(passed_data);
    }
  });

  return deferred.promise;
}


function check_coupon_valid(data) {
  logger.log();
  var deferred = Q.defer();

  if (data.coupon.status === 'active') {
    deferred.resolve(data);
  } else {
    deferred.reject('Coupon not usable');
  }
  return deferred.promise;
}

module.exports.process = function(data) {
  var deferred = Q.defer();
  var user_id = data.user._id;
  var coupon_id = data.coupon._id;
  var outlet_id = data.outlet._id;
  var coupon = data.coupon;
  coupon.status = "redeemed";
  var update = {
    $set: {
      "coupons.$.status": "redeemed",
      "coupons.$.used_details": {
        used_time: new Date(),
        used_by: user_id,
        used_at: outlet_id,
      }
    }
  }

  User.findOneAndUpdate({
      _id: user_id,
      'coupons._id': coupon_id
    },
    update,
    function(err, user) {
      if (err) {
        deferred.reject('Error redeeming the coupon');
      }

      deferred.resolve(data);
    }
  );

  return deferred.promise;
};
