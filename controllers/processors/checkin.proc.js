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
  check_and_create_coupon(data)
    .then(function(data) {
      return update_checkin_counts(data);
    })
    .then(function(data) {
      return update_qr_count(data);
    })
    .then(function(data) {
      return send_sms(data);
    })
    .then(function(data) {
      deferred.resolve(data);
    })
    .fail(function(err) {
      deferred.reject(err);
    })

  return deferred.promise;
};

// ALL THE CHECKS
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
  var passed_data = data;
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

    if (isOutletClosed(qr)) {
      deferred.reject('QR code used at a closed outlet');
    }
    passed_data.qr = qr;
    passed_data.outlet = qr.outlet_id; // SO THAT THE OUTLET IS SAVED IN THE EVENT TABLE
    deferred.resolve(passed_data);
  });

  return deferred.promise;
}

function already_checked_in(data) {
  logger.log();
  var SIX_HOURS = new Date(Date.now() - 21600000);
  var FIVE_MINS = new Date(Date.now() - 300000);

  var deferred = Q.defer();
  deferred.resolve(data); // TEMPORARY

  var user_id = _.get(data, 'user._id');
  var outlet_id = _.get(data, 'outlet._id');

  Event.find({
    'event_user': user_id,
    'event_type': 'checkin',
    'event_date': {
      $gt: SIX_HOURS
    }
  }, function(err, events) {
    if (err) {
      deferred.reject(err);
    }

    if (events.length) {
      var same_outlet = _.filter(events, {
        event_outlet: outlet_id
      });
      if (same_outlet.length !== 0) {
        deferred.reject('Already checked in here');
      }

      var too_soon = _.find(events, function(event) {
        return event.event_date > FIVE_MINS;
      });

      if (too_soon) {
        deferred.reject('Checked in at another outlet less than 5 minutes ago!');
      }
    }
    deferred.resolve(data);
  })

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

// ALL THE PROCESSING
function check_and_create_coupon(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  var user_id = _.get(data, 'user._id');
  var outlet_id = _.get(data, 'outlet._id');

  var offers = _.get(data, 'outlet.offers');
  var sorted_checkin_offers = _.sortBy(_.filter(offers, {
    'offer_type': 'checkin'
  }), 'rule.event_count');

  Event.find({
    'event_user': user_id,
    'event_type': 'checkin',
    'event_outlet': outlet_id
  }, function(err, events) {
    if (err) {
      deferred.reject(err);
    }

    var matching_offer = find_matching_offer(events, sorted_checkin_offers);
    if (matching_offer) {
      create_coupon(matching_offer, user_id, outlet_id).then(function(data) {
        deferred.resolve(passed_data);
      }, function(err) {
        deferred.reject('Could not create coupon' + err);
      })
    } else {
      deferred.resolve(data);
    }
  });
  return deferred.promise;
}

function create_coupon(offer, user, outlet) {
  logger.log();

  var keygen = require('keygenerator');
  var code = keygen._({
    forceUppercase: true,
    length: 6,
    exclude: ['O', '0', 'L', '1']
  });

  var deferred = Q.defer();
  var outlets = [];
  outlets.push(outlet);
  var update = {
    $push: {
      coupons: {
        _id: mongoose.Types.ObjectId(),
        code: code,
        outlets: outlets,
        coupon_source: {
          type: 'qr_checkin'
        },
        header: offer.actions.reward.header,
        line1: offer.actions.reward.line1,
        line2: offer.actions.reward.line2,
        lapse_date: new Date(),
        expiry_date: new Date(),
        meta: {
          reward_type: {
            type: 'need to fix' // to fix = where from?
          }
        },
        status: 'active',
        issued_at: new Date()
      }
    }
  };

  User.findOneAndUpdate({
    _id: user
  }, update, function(err, user) {
     console.log(err);
    // console.log(user);
    if (err || !user) {
      deferred.reject('Could not update user');
    } else
      deferred.resolve(user);
  });

  return deferred.promise;
}

function find_matching_offer(events, offers) {
  var i = 0;
  var checkins = events.length + 1; // TO COUNT THIS CHECKIN AS WELL
  var count, match;

  for (i = 0; i < offers.length; i++) {
    count = _.get(offers[i], 'rule.event_count');
    match = _.get(offers[i], 'rule.event_match');

    if (match === 'on every') {
      if (checkins % count === 0) {
        return offers[i];
      }
    }

    if (match === 'on only') {

      if (checkins === count) {
        return offers[i];
      }
    }

    if (match === 'after') {

      if (checkins > count) {
        return offers[i];
      }
    }
  }

  return undefined;
}

function update_checkin_counts(data) {
  // UPDATE CACHES?
  var deferred = Q.defer();
  deferred.resolve(data);
  return deferred.promise;
}

function update_qr_count(data) {
  var deferred = Q.defer();
  //console.log(data);
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

function send_sms(data) {
  var deferred = Q.defer();
  deferred.resolve(data);
  return deferred.promise;
}
