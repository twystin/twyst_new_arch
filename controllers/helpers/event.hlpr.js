'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Event = mongoose.model('Event');
var User = mongoose.model('User');
var Transporter = require('../../transports/transporter');
var OutletHelper = require('./outlet.hlpr');
var Utils = require('../../common/datetime.hlpr.js');
var Cache = require('../../common/cache.hlpr');
var Notification = mongoose.model('Notification');

module.exports.get_event_list = function(user, event_type) {
  var deferred = Q.defer();

  if (user.role > 5) {
    rejectUser(deferred);
  } 
  else if (user.role > 2) {
    listEventsForMerchant(user, event_type).then(function(data) {
      deferred.resolve({data: data.data, message: data.message});
    }, function(err) {
      deferred.reject({err: err.err, message: err.message});
    });
  } 
  else {
    listEventsForAdmin(event_type).then(function(data) {
      deferred.resolve({data: data.data, message: data.message});
    }, function(err) {
      deferred.reject({err: err.err, message: err.message});
    })
  }
  return deferred.promise;
}

module.exports.get_upload_bills = function(user, status, sort) {
  logger.log();

  var deferred = Q.defer();

  if(user.role > 5) {
    rejectUser(deferred);
  } else {
    var query = {
      event_type: 'upload_bill',
    };

    if(status) {
      query['event_meta.status'] = status
    }

    if(user.role > 2) {
      query.event_outlet = {
        '$in': user.outlets
      }
      query['event_meta.offer_group'] = {
        $exists: true
      }
    };

    Event.find(query).exec(function(err, events) {
      if(err || !events) {
        deferred.reject({
          err: err || null, 
          message: "Unable to retrieve bills" 
        });
      } else {
        deferred.resolve({
          data: events, 
          message: 'Found the bills' 
        });
      }
    });

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
    updateEventFromConsole(event).then(function(data) {
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
  if(event_type === 'upload_bill') {
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
    event_type: 'upload_bill'
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
      if(_.has(event, 'event_outlet') && user_outlets.indexOf(event.event_outlet.toString()) === -1) {
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
      var coupon_ids = _.map(events, 'event_meta.offer_group');
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
            return coupon.status==='redeemed' && coupon.code && coupon_ids.indexOf(coupon.issued_for.toString())===-1;
          });
          var pending = [];
          _.each(coupons, function(coupon) {
            var coupon_obj = {
              code: coupon.code,
              issued_for: coupon.issued_for,
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
    deferred.resolve({
      data: event,
      message: 'Event update successful.'
    });
    
  }
  return deferred.promise;
}

function updateEventFromConsole(event) {
  logger.log();
  var deferred = Q.defer();
  if(event.event_meta.status === 'Twyst Rejected') {
    updateBillStatus(event)
      .then(function(data){
        return getUserGcmId(event)
      })
      .then(function(data) {
        return getOutletInfo(data)
      })
      .then(function(data) {
        var payload = {};
        console.log('rejected')         
        payload.body = "Your bill for " + data.event_meta.outlet_name + ' dated ' 
        +data.event_meta.bill_date+
        ' has been rejected! ' + data.event_meta.reason;  

        payload.head = "Bill Rejected"; 
        sendNotification(data, payload).then(function(){
          saveNotification(data, payload, 'bill_rejected').then(function(){
            deferred.resolve({
              data: data,
              message: 'Bill Processed successfully.'
            }); 
          }) 
        })
      });
  }
  else{
    Event.findOne({
    _id: {$nin: [event._id]},
    event_outlet: event.event_outlet,
    'event_meta.bill_number': event.event_meta.bill_number,
    'event_meta.bill_amount': event.event_meta.bill_amount
    }).exec(function(err, already_submitted) {
      if(err) {
        console.log(err)
        deferred.reject({
          err: err || null, 
          message: "Unable to retrieve bills" 
        });
      } 
      else if(already_submitted){
        event.event_meta.status = 'Twyst Rejected';
        updateBillStatus(event)
          .then(function(data){
            return getUserGcmId(event)
          })
          .then(function(data){
            console.log('already uploaded');
            var payload = {};
            payload.body = "Your bill for " + data.event_meta.outlet_name + ' dated ' 
              +data.event_meta.bill_date+
              ' has been rejected! This bill has been already uploaded on Twyst by someone else. ';  

            payload.head = "Bill Rejected";  
            sendNotification(data, payload).then(function(){
              saveNotification(data, payload, 'bill_rejected').then(function(){
                deferred.resolve({
                  data: data,
                  message: 'Bill Processed successfully.'
                }); 
              }, function(err) {
                deferred.reject({
                  err: err || true,
                  message: data.message
                }); 
              });
            }, function(err) {
              deferred.reject({
                err: err || true,
                message: data.message
              }); 
            });
            
          });
      }
      else{
        updateBillStatus(event)
          .then(function(data){
            return getUserGcmId(event)
          })
          .then(function(data) {
            return getOutletInfo(data)
          })
          .then(function(data) {
            var payload = {};
            if(data.event_meta.status === 'Twyst Approved') {
              console.log('approved');
        
              update_twyst_bucks(data).then(function(data){
                if(data.outlet.data.contact.location.locality_1.toString()) {
                  payload.body = "Your bill for " + data.outlet.data.basics.name + ','+ 
                  data.outlet.data.contact.location.locality_1.toString() + 
                  ',dated '+data.event_meta.bill_date+
                  ' has been approved! You have checked-in and earned 50 Twyst Bucks';  
                }
                else{
                  payload.body = "Your bill for " + data.outlet.data.basics.name + ','+ 
                  data.outlet.data.contact.location.locality_2.toString() + 
                  ',dated '+data.event_meta.bill_date+
                  ' has been approved! You have checked-in and earned 50 Twyst Bucks';  
                }
                payload.head = "Bill Approved";
                sendNotification(data, payload).then(function(){
                  saveNotification(data, payload, 'bill_approved').then(function(){
                    deferred.resolve({
                      data: data,
                      message: 'Bill Processed successfully.'
                    }); 
                  }, function(err) {
                    deferred.reject({
                      err: err || true,
                      message: data.message
                    }); 
                  });
                }, function(err) {
                  deferred.reject({
                    err: err || true,
                    message: data.message
                  }); 
                });

              }, function(err) {
                deferred.reject({
                  err: err || true,
                  message: data.message
                }); 
              });
                
            }
        })
      }
    })  
  }

  return deferred.promise;
}

function updateBillStatus(passed_data) {
  logger.log();
  var deferred = Q.defer();

  Event.findOneAndUpdate({
    _id: ObjectId(passed_data._id),
  }, {
    $set: {
      event_meta: passed_data.event_meta,
      event_outlet: passed_data.event_outlet
    }
  }).exec(function(err, updated_event) {
    if (err || !updated_event) {
      deferred.reject({
        err: err || true,
        message: 'Event Cannot be updated right now'
      });
    }       
    else {
      deferred.resolve({
        data: passed_data, 
        message: 'bill status updated' 
      });
    }
  }); 
  return deferred.promise; 
}

function getUserGcmId(passed_data){
  logger.log();
  var deferred = Q.defer();

  User.findOne({_id: passed_data.event_user}, {}, function(err, event_user) {
    if(err || !event_user) {
      console.log(err);
      deferred.reject(err);
    } 
    else {
      passed_data.user = event_user;

      deferred.resolve(passed_data);
        
    }
      
  }) 
  return deferred.promise;
}

function getOutletInfo(passed_data){
  logger.log();
  var deferred = Q.defer();
  OutletHelper.get_outlet(passed_data.event_outlet).then(function(data) {
    passed_data.outlet = data
    deferred.resolve(passed_data);
  }, function(err) {
    deferred.resolve(passed_data);
  });
  return deferred.promise;
}

function update_twyst_bucks(data) {
  logger.log();
  var deferred = Q.defer();

  var event_type = 'upload_bill';
  var available_twyst_bucks = data.user.twyst_bucks;
  var update_twyst_bucks = {
    $set: {

    }
  }

  Cache.hget('twyst_bucks', "twyst_bucks_grid", function(err, reply) {
    if (err || !reply) {
      deferred.reject('Could not get bucks grid' + err);
    } else {

      var bucks_grid = JSON.parse(reply);

      _.find(bucks_grid, function(current_event) {
        if (current_event.event === event_type) {
         
          data.user.twyst_bucks = available_twyst_bucks + current_event.bucks;
          
          update_twyst_bucks.$set.twyst_bucks = data.user.twyst_bucks;

          User.findOneAndUpdate({
            _id: data.user._id
          }, update_twyst_bucks, function(err, user) {
            if (err) {
              deferred.reject('Could not update user bucks' + err);
            } else {
              console.log('updated bucks')
              deferred.resolve(data);
            }
          });
        }
      })
      
    }
  });  
  
  return deferred.promise;
}

function sendNotification(data, payload) {
  logger.log();
  var deferred = Q.defer();
 
  if(data.user.push_ids && data.user.push_ids.length) {
    payload.gcms = data.user.push_ids[data.user.push_ids.length-1].push_id;    
  }

  Transporter.send('push', 'gcm', payload).then(function(){
    deferred.resolve({
      data: data,
      message: 'notification sent.'
    });    
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: data.message
    }); 
  });
  return deferred.promise;
}

function saveNotification(passed_data, payload, action_icon) {
  logger.log();
  var deferred = Q.defer();

  var notif = {};
  notif.message  = payload.body;
  notif.detail  = payload.head;
  notif.icon  = action_icon;
  notif.expire  = new Date();
  notif.shown  = false;
  notif.link  = 'discover';
  notif.user  = passed_data.event_user;
  notif.outlet  = null;
  notif.notification_type = 'push'; // either push or pul
  notif.created_at = new Date();
  var notification = new Notification(notif);
  
  notification.save(function(err, saved_event){
    if(err || !saved_event) {
      console.log(err)
      deferred.reject({
        err: err || true,
        message: data.message
      }); 
    }
    else{
      console.log('notif saved')
      deferred.resolve({
        data: passed_data,
        message: 'notification listed successfully.'
      }); 
    }
  })
  return deferred.promise;
}
