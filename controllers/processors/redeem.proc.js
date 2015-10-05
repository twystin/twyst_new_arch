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
var RecoHelper = require('../helpers/reco.hlpr');
var Transporter = require('../../transports/transporter.js');
var Utils = require('../../common/datetime.hlpr.js');


module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();

  check_coupon_code_and_outlet(data)
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

function check_coupon_code_and_outlet(data) {
  logger.log();
  var deferred = Q.defer();

  if (!_.get(data, 'event_data.event_meta.coupon') || !_.get(data, 'event_data.event_outlet')) {
    deferred.reject('No coupon code or outlet sent to redeem');
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
  coupon.status = "user_redeemed";
  var update = {
    $set: {
      "coupons.$.status": "user_redeemed",
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
      } else {
        sendMessageToMerchant(coupon, data.outlet, data.user.phone);       
        deferred.resolve(data);
      }
    }
  );

  return deferred.promise;
};

function sendMessageToMerchant(coupon, outlet, user_phone) {
    var current_time = new Date();    
    var payload  = {}
    
    payload.from = 'TWYSTR'
    if(outlet.contact.location.locality_1) {
        payload.message = 'User '+user_phone+' has redeemed coupon at '+ outlet.basics.name + ', ' + outlet.contact.location.locality_1.toString()+' on ' +Utils.formatDate(current_time)+ '. Coupon code '+coupon.code+', Offer- '+coupon.header+' '+ coupon.line1+' '+coupon.line2+'.'     
    }
    else{
        payload.message = 'User '+user_phone+' has redeemed coupon at '+ outlet.basics.name + ', ' + outlet.contact.location.locality_2.toString()+' on ' +Utils.formatDate(current_time)+ '. Coupon code '+coupon.code+', Offer- '+coupon.header+' '+ coupon.line1+' '+coupon.line2+'.' 
    }
    
    
    outlet.contact.phones.reg_mobile.forEach (function (phone) {
        if(phone && phone.num) {
            payload.phone = phone.num;
            Transporter.send('sms', 'vf', payload);
        }
    });
}