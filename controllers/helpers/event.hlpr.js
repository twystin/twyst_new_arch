'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Event = mongoose.model('Event');
var User = mongoose.model('User');

module.exports.get_event_list = function(user, event_type) {
  var deferred = Q.defer();

  if (user.role > 5) {
    rejectUser(deferred);
  } else if (user.role > 2) {
    listEventsForMerchant(user, event_type).then(function(data) {
      deferred.resolve({data: data.data, message: data.message});
    }, function(err) {
      deferred.reject({err: err.err, message: err.message});
    });
  } else {
    listEventsForAdmin(event_type).then(function(data) {
      deferred.resolve({data: data.data, message: data.message});
    }, function(err) {
      deferred.reject({err: err.err, message: err.message});
    })
  }
  return deferred.promise;
}

module.exports.get_event = function(user, event_id) {
  var deferred = Q.defer();
  if (user.role > 5) {
    rejectUser(deferred);
  } else if (user.role > 2) {
    getEventForMerchant(user, event_id).then(function(data) {
      deferred.resolve({
        data: data.data,
        message: data.message
      });
    }, function(err) {
      deferred.reject({
        err: err.err,
        message: err.message
      });
    });
  } else {
    getEventForAdmin(event_id).then(function(data) {
      deferred.resolve({
        data: data.data,
        message: data.message
      });
    }, function(err) {
      deferred.reject({
        err: err.err,
        message: err.message
      });
    });
  }
  return deferred.promise;
}

module.exports.update_event = function(user, event) {
  logger.log();
  var deferred = Q.defer();
  if (user.role > 5) {
    rejectUser(deferred);
  } else if (user.role > 2) { // todo: reverse logic and check once db issues fixed
    updateEventForMerchant(user, event).then(function(data) {
      deferred.resolve({
        data: data.data,
        message: data.message
      });
    }, function(err) {
      deferred.reject({
        err: err.err,
        message: err.message
      });
    });
  } else {
    updateEventForAdmin(event).then(function(data) {
      deferred.resolve({
        data: data.data,
        message: data.message
      });
    }, function(err) {
      deferred.reject({
        err: err.err,
        message: err.message
      });
    })
  }
  return deferred.promise;
}

function rejectUser(deferred, err) {
  logger.log();
  deferred.reject({
    err: err || false,
    message: 'Not authorized'
  });
}

function listEventsForMerchant(user, event_type) {
  logger.log();
  var deferred = Q.defer();
  if(event_type==='upload_bill') {
    getBillListForMerchant(user.outlets).then(function(data) {
      deferred.resolve({data: data.data, message: data.message });
    }, function(err) {
      deferred.reject({err: err.err, message: err.message })
    })
  } else {
    deferred.resolve({data: {}, message: 'Not yet implemented' });
  }
  return deferred.promise;
}

function listEventsForAdmin(event_type) {
  logger.log();
  var deferred = Q.defer();
  if(event_type==='upload_bill') {
    getBillListForAdmin().then(function(data) {
      deferred.resolve({data: data.data, message: data.message});
    }, function(err) {
      deferred.reject({err: err.err, message: err.message});
    });
  } else {
    deferred.resolve({data: {}, message: 'Not yet implemented' });
  }
  return deferred.promise;
}

function getBillListForMerchant(user_outlets) {
  logger.log();
  var deferred = Q.defer();
  Event.find({
    event_type: 'upload_bill',
    'event_meta.offer_group': {
      $exists: true
    },
    event_outlet: {
      $in: user_outlets
    }
  }).exec(function(err, events) {
    if(err || !events) {
      deferred.reject({err: err || null, message: "Unable to retrieve bills" });
    } else {
      deferred.resolve({data: events, message: 'Found the bills' });
    }
  });
  return deferred.promise;
}

function getBillListForAdmin() {
  logger.log();
  var deferred = Q.defer();
  Event.find({
    event_type: 'upload_bill',
    'event_meta.offer_group': {
      $exists: true
    }
  }).exec(function(err, events) {
    if(err || !events) {
      deferred.reject({err: err || null, message: "Unable to retrieve bills" });
    } else {
      deferred.resolve({data: events, message: 'Found the bills' });
    }
  });
  return deferred.promise;
}

function getEventForAdmin(event_id) {
  logger.log();
  var deferred = Q.defer();
  Event.findById(event_id).exec(function(err, event) {
    if (err || !event) {
      deferred.reject({
        err: err || false,
        message: 'Event cannot be loaded right now'
      });
    } else if (event.event_type === 'upload_bill') {
      processUploadBillForAdmin(event).then(function(data) {
        deferred.resolve({
          data: data.data,
          message: data.message
        });
      }, function(err) {
        deferred.reject({
          err: err.err,
          message: err.message
        });
      });
    } else {
      deferred.reject({
        err: null,
        message: 'Not yet implemented'
      });
    }
  });
  return deferred.promise;
}

function getEventForMerchant(user, event_id) {
  logger.log();
  var deferred = Q.defer();
  Event.findById(event_id).exec(function(err, event) {
    if(err || !event) {
      deferred.reject({
        err: err || false,
        message: 'Event cannot be loaded right now'
      });
    } else {
      event = event.toJSON();
      var user_outlets = _.map(user.outlets, function(outlet) { return outlet.toString(); });
      if(_.has(event, 'event_outlet') && user_outlets.indexOf(event.event_outlet.toString())===-1) {
        deferred.reject({
          err: null,
          message: 'Not authorized'
        });
      } else {
        deferred.resolve({data: event, message: 'Event found' });
      }
    }
  });
  return deferred.promise;
}

function processUploadBillForAdmin(event) {
  logger.log();
  var deferred = Q.defer();
  Event.find({
    event_type: event.event_type,
    'event_meta.offer_group': {
      $exists: true
    },
    event_user: event.event_user
  }).exec(function(err, events) {
    if(err || !events) {
      deferred.reject({
        err: err || false,
        message: 'Event cannot be loaded right now'
      });
    } else {
      event = event.toJSON();
      logger.log(events);
      var coupon_ids = _.map(events, 'event_meta.offer_group');
      logger.log(coupon_ids);
      User.findOne({
        _id: ObjectId(event.event_user)
      }).exec(function(err, event_user) {
        if(err || !event_user) {
          deferred.reject({
            err: err || false,
            message: 'Event cannot be loaded right now'
          });
        } else {
          var coupons = _.filter(event_user.coupons, function(coupon) {
            logger.log(coupon);
            return coupon.status==='redeemed' && coupon.code && coupon_ids.indexOf(coupon.coupon_group.toString())===-1;
          });
          var pending = [];
          _.each(coupons, function(coupon) {
            var coupon_obj = {
              code: coupon.code,
              offer_group: coupon.coupon_group,
              header: coupon.header,
              line1: coupon.line1,
              line2: coupon.line2,
              used_time: coupon.used_details.used_time
            };
            pending.push(coupon_obj);
          });
          event.pending = pending;
          deferred.resolve({
            data: event,
            message: 'Found the event'
          });
        }
      });
    }
  });
  return deferred.promise;
}

function updateEventForMerchant(user, event) {
  logger.log();
  var deferred = Q.defer();
  var user_outlets = _.map(user.outlets, function(outlet) {
    return outlet.toString();
  })
  if (user_outlets.indexOf(event.event_outlet.toString()) === -1) {
    deferred.reject({
      err: false,
      message: 'Not authorized'
    });
  } else {
    Event.findOneAndUpdate({
      _id: ObjectId(event._id),
    }, {
      $set: {
        "event_meta": event.event_meta
      }
    }).exec(function(err, event) {
      if (err || !event) {
        deferred.reject({
          err: err || true,
          message: 'Event Cannot be updated right now'
        });
      } else {
        deferred.resolve({
          data: event,
          message: 'Event update successful.'
        });
      }
    });
  }
  return deferred.promise;
}

function updateEventForAdmin(event) {
  logger.log();
  var deferred = Q.defer();
  Event.findOneAndUpdate({
    _id: ObjectId(event._id),
  }, {
    $set: {
      "event_meta": event.event_meta
    }
  }).exec(function(err, event) {
    if (err || !event) {
      deferred.reject({
        err: err || true,
        message: 'Event Cannot be updated right now'
      });
    } else {
      deferred.resolve({
        data: event,
        message: 'Event update successful.'
      });
    }
  });
  return deferred.promise;
}