var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
require('../../models/qr_code.mdl.js');
var QR = mongoose.model('QR');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  validate_qr(data)
    .then(function(data) {
      return already_checked_in(data);
    })
    .then(function(data) {
      deferred.resolve(data);
    })
    .fail(function(err) {
      deferred.reject(err);
    })
  return deferred.promise;
};

module.exports.process = function(data) {
  logger.log();
  var deferred = Q.defer();
  deferred.resolve(true);
  return deferred.promise;
};

function check_outlet(data) {
  logger.log();
  var deferred = Q.defer();
  if (!_.get(data, 'event_data.event_outlet')) {
    deferred.reject('Checkin requires an outlet to be passed');
  } else {
    deferred.resolve(data);
  }

  return deferred.promise;
}

function validate_qr(data) {
  logger.log();
  var deferred = Q.defer();
  var code = _.get(data, 'event_data.event_meta.code');
  if (!code) {
    deferred.reject('QR checkin needs a QR code to be sent');
  };

  QR.findOne({
    code: code
  }).populate('outlet_id').exec(function(err, qr) {
    if (err || !qr) {
      deferred.reject('Could not find the QR code');
    }

    if (isExpired(qr)) {
      deferred.reject('QR code has expired');
    }

    if (isUsedTooMany(qr)) {
      deferred.reject('QR has been used too many times');
    }

    if (_.get(qr, 'outlet_id.outlet_meta.status') !== 'active') {
      deferred.reject('QR code used at an outlet that is not active');
    }

    if (isOutletClosed(qr) {
      deferred.reject('QR code used at a closed outlet');
    })
    deferred.resolve(data);
  });

  return deferred.promise;
}

function already_checked_in(data) {
  logger.log();
  var deferred = Q.defer();
  deferred.resolve(data);
  return deferred.promise;
}

function isExpired(qr) {
  if (new Date(qr.validity.start) < new Date() && new Date(qr.validity.end) > new Date()) {
    return false;
  }
  return true;
}

function isUsedTooMany(qr) {
  if (qr.times_used <= qr.max_use_limit) {
    return false;
  }
  return true;
}

function isOutletClosed(qr) {
  // CHECK IF THE OUTLET IS CURRENTLY CLOSED
  return false;
}
