var logger = require('tracer').colorConsole();

var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
require('../../models/qr_code.mdl');
var QR = mongoose.model('QR');
var CheckinHelper = require('../helpers/checkin.hlpr');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();

  data.event_data.event_meta.date = new Date();
  validate_qr(data)
    .then(function(data) {
      return CheckinHelper.already_checked_in(data);
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
  CheckinHelper.check_and_create_coupon(data)
    .then(function(data) {
      return CheckinHelper.update_checkin_counts(data);
    })
    .then(function(data) {
      return update_qr_count(data);
    })
    .then(function(data) {
      data.event_data.event_type = 'checkin';
      data.event_data.event_meta.event_type = 'qr_checkin';
      deferred.resolve(data);
    })
    .fail(function(err) {
      deferred.reject(err);
    })

  return deferred.promise;
};

function validate_qr(data) {
  logger.log();
  var passed_data = data;
  var deferred = Q.defer();
  var code = _.get(data, 'event_data.event_meta.code');
  if (!code) {
    deferred.reject('QR checkin needs a QR code to be sent');
  };
  if(/^http/.test(code)) {
    code = code.slice(code.lastIndexOf('/') + 1);
    data.event_data.event_meta.code = code;
  }
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

    if (isOutletClosed(qr)) {
      deferred.reject('QR code used at a closed outlet');
    }
    passed_data.qr = qr;
    passed_data.outlet = qr.outlet_id; // SO THAT THE OUTLET IS SAVED IN THE EVENT TABLE
    deferred.resolve(passed_data  );
  });

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
  var date = new Date();
    var time = (parseInt(date.getHours())+5) +':'+(parseInt(date.getMinutes())+30);
    date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();

    if (qr.outlet && qr.outlet.business_hours ) {
      if(RecoHelper.isClosed(date, time, outlet.business_hours)) {
          return true;
      }
  }
  else{
    return false;
  }
}

function update_qr_count(data) {
  var deferred = Q.defer();
  QR.findOneAndUpdate({
    code: data.event_data.event_meta.code
  }, {
    $inc: {
      times_used: 1
    }
  }, function(err, qr) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
}
