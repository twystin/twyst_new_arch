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
var CheckinHelper = require('./checkin.hlpr');
var Utils = require('../../common/datetime.hlpr.js');
var Cache = require('../../common/cache.hlpr');
var Notification = mongoose.model('Notification');

module.exports.get_event_list = function(user, event_type, status) {
  logger.log();

  var deferred = Q.defer();

  if (user.role > 5) {
    rejectUser(deferred);
  } 
  else if (user.role > 2) {
    listEventsForMerchant(user, event_type, status).then(function(data) {
      deferred.resolve({data: data.data, message: data.message});
    }, function(err) {
      deferred.reject({err: err.err, message: err.message});
    });
  } 
  else {
    listEventForConsole(event_type, status).then(function(data) {
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
    getEventForConsole(event_id).then(function(data) {
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
    updateEventFromMerchant(user, event).then(function(data) {
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

function listEventsForMerchant(user, event_type, status) {
  logger.log();
  var deferred = Q.defer();
  
  Event.find({
    event_type: event_type,
    'event_meta.status': status,
    event_outlet: {
      $in: user.outlets
    },
  }).exec(function(err, events) {
    if(err || !events) {
      deferred.reject({err: err || null, message: "Unable to retrieve events list" });
    } else {
      deferred.resolve({data: events, message: 'Found the list' });
    }
  });
  return deferred.promise;
}

function listEventForConsole(event_type, status) {
  logger.log();
  var deferred = Q.defer();
  console.log(status + ' ' + event_type);
  Event.find({
    event_type: event_type,
    'event_meta.status': status
  }).populate('event_outlet').exec(function(err, events) {
    if(err || !events) {
      deferred.reject({err: err || null, message: "Unable to retrieve events list" });
    } 
    else {
      User.populate(events, {
          path: 'event_user'
        }, function(err, populated) {
          if(err || !populated) {
            deferred.reject({err: err || null, message: 'Unable to retrieve events list' });
          } else {
            deferred.resolve({data: populated, message: 'Found the list' });
          }
        })
    }
  });
  
  return deferred.promise;
}


function getEventForConsole(event_id) {
  logger.log();
  var deferred = Q.defer();
  Event.findById(event_id).exec(function(err, event) {
    if (err || !event) {
      deferred.reject({
        err: err || false,
        message: 'Event cannot be loaded right now'
      });
    } 
    else if (event.event_type === 'upload_bill') {
      getOffersUsed(event).then(function(data) {
        
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
    else {
      event.event_meta.user = event.event_user;
      User.populate(event, {
        path: 'event_meta.user'
      }, function(err, populated) {
        if(err || !populated) {
          deferred.reject({
            err: err || null,
            message: 'Unable to retrieve'
          })
        } else {
          deferred.resolve({
            data: populated,
            message: 'Retrieval successful'
          });
        }
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

function getOffersUsed(event) {
  logger.log();
  var deferred = Q.defer();

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
        return coupon.coupon_source === 'exclusive_offer' && coupon.status==='active';
      });
      var passed_data = {}
      passed_data.pending = {};
      passed_data.pending = coupons;
      passed_data.data = event
      
      deferred.resolve({
        data: passed_data,
        message: 'Found the event'
      });
    }
  });
    
  return deferred.promise;
}

function updateEventFromMerchant(user, event) {
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
  } 
  else {
    updateBillStatus(event).then(function(data) {
      updateOfferUsedStatus(event).then(function(data){
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
    }); 
  }
  return deferred.promise;
}

function updateEventFromConsole(event) {
  logger.log();
  var deferred = Q.defer();

  if(event.event_type === "upload_bill") {
    if(event.event_meta.status === 'archived' ) {
      updateBillStatus(event).then(function(data) {
        deferred.resolve({
          data: data.data,
          message: 'Bill Processed successfully.'
        });
      }, function(err) {
        deferred.reject({
          err: err || true,
          message: data.message
        });   
      })
               
    }
    else if(event.event_meta.status === 'twyst_rejected') {
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
    else if(event.event_meta.status === 'twyst_approved' || event.event_meta.status === 'outlet_pending'){
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
          event.event_meta.status = 'twyst_rejected';
          updateBillStatus(event)
            .then(function(data){
              return getUserGcmId(event)
            })
            .then(function(data){
              console.log('already uploaded');
              var payload = {};
              payload.body = "Your bill for " + data.event_meta.outlet_name + ' dated ' 
                +data.event_meta.bill_date+
                ' has been rejected! This bill has been already uploaded on Twyst by someone else.';  

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
              return checkinUser(data)
            })
            .then(function(data) {
              var payload = {};
              var twyst_bucks_earn  = 0;
              if(data.event_meta.status === 'twyst_approved') {
                console.log('twyst approved');
                twyst_bucks_earn = 50;
              }
              else if(data.event_meta.status === 'outlet_pending'){
                console.log('outlet pending');
                twyst_bucks_earn = 150;
              }
          
              update_twyst_bucks(data).then(function(data){
                if(data.outlet.data.contact.location.locality_1.toString()) {
                  
                    payload.body = "Your bill for " + data.outlet.data.basics.name + ','+ 
                  data.outlet.data.contact.location.locality_1.toString() + 
                  ',dated '+data.event_meta.bill_date+
                  ' has been approved! You have checked-in and earned ' + twyst_bucks_earn+ ' Twyst Bucks';    
                  
                }
                else{
                  if(data.is_checkin) {
                    payload.body = "Your bill for " + data.outlet.data.basics.name + ','+ 
                  data.outlet.data.contact.location.locality_2.toString() + 
                  ',dated '+data.event_meta.bill_date+
                  ' has been approved! You have checked-in and earned ' + twyst_bucks_earn+ ' Twyst Bucks';    
                  }
                  else {
                    payload.body = "Your bill for " + data.outlet.data.basics.name + ','+ 
                  data.outlet.data.contact.location.locality_2.toString() + 
                  ',dated '+data.event_meta.bill_date+
                  ' has been approved! You have earned ' + twyst_bucks_earn+ ' Twyst Bucks';  
                  }
                  
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
          })
          .fail(function(err) {
            console.log(err);
            deferred.reject({
              err: err || true,
              message: 'Unknown error'
            });
          })
        }
      })  
    }
  } else {
    Event.update({
      _id: event._id
    }, {
      $set: {
        event_meta: event.event_meta
      }
    }, function(err) {
      if(err) {
        deferred.reject({
          err: err || true,
          message: 'Unable to update at the moment'
        });
      } else {
        deferred.resolve({
          data: event,
          message: 'Update successfully'
        })
      }
    })
  }

  return deferred.promise;
}

function updateOfferUsedStatus(passed_data){
  logger.log();
  var deferred = Q.defer();

  User.findOneAndUpdate({
    _id: passed_data.event_user,
    'coupons._id': passed_data.event_meta.pending_coupon
  }, {
    $set: {
      'coupons.$.status': passed_data.event_meta.status
    }
  }).exec(function(err, updated_user) {
    if (err || !updated_user) {
      console.log(err);
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

function updateBillStatus(passed_data) {
  logger.log();
  var deferred = Q.defer();

  Event.findOneAndUpdate({
    _id: ObjectId(passed_data._id),
  }, {
    $set: {
      event_meta: passed_data.event_meta,
      event_outlet: passed_data.event_outlet,

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
  var offer_cost = 0;
  var available_twyst_bucks = data.user.twyst_bucks;
  var update_twyst_bucks = {
    $set: {

    }
  }
  if(data.event_meta.status === 'outlet_pending') {
    offer_cost = 100; //should change this later
  }

  Cache.hget('twyst_bucks', "twyst_bucks_grid", function(err, reply) {
    if (err || !reply) {
      deferred.reject('Could not get bucks grid' + err);
    } else {

      var bucks_grid = JSON.parse(reply);

      _.find(bucks_grid, function(current_event) {
        if (current_event.event === event_type) {
         
          data.user.twyst_bucks = available_twyst_bucks + current_event.bucks + offer_cost;
          
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
  notif.message  = payload.head;
  notif.detail  = payload.body;
  notif.icon  = action_icon;
  notif.expire  = new Date();
  notif.shown  = false;
  notif.link  = 'discover';
  notif.user  = passed_data.event_user;
  notif.status = 'sent';
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

function checkinUser(passed_data) {
  logger.log();
  var deferred = Q.defer();

  var checkin_offers = _.filter(passed_data.outlet.data.offers, {
      'offer_type': 'checkin'
  })

  if(checkin_offers && checkin_offers.length) {
    var obj = {};
    obj.event_data = {};
    obj.event_data.event_meta = {};
    obj.event_data.event_meta.phone = passed_data.user.phone;
    obj.event_data.event_meta.date = new Date(passed_data.event_date);
    obj.event_data.event_meta.outlet = passed_data.outlet.data;
    obj.outlet = passed_data.outlet.data;
    obj.event_data.event_outlet = passed_data.outlet.data._id;
    obj.event_data.event_type = 'upload_bill'
    
    CheckinHelper.validate_request(obj)
      .then(function(data) {
        return CheckinHelper.already_checked_in(data);
      })
      .then(function(data) {
        return CheckinHelper.check_and_create_coupon(data)
      })
      .then(function(data) {
        return logCheckinEvent(data)
      })
      .then(function(data) {
          return CheckinHelper.update_checkin_counts(data);
      })
      .then(function(data) {
          deferred.resolve(passed_data);
      })
      .fail(function(err) {
          deferred.reject(err);
      })
  }
  else{
    deferred.resolve(passed_data);
  }
  

  return deferred.promise;

}

function logCheckinEvent(passed_data) {
  logger.log();
  var deferred = Q.defer();

  var event = {};
  event.event_meta = {};
  event.event_user = passed_data.user._id;
  event.event_type = 'checkin';
  event.event_date = new Date();
  event.event_meta.event_type = 'upload_bill';
  event.event_meta.event_date = passed_data.event_data.event_meta.date;
  event.event_meta.phone = passed_data.event_data.event_meta.phone;

  if (passed_data.outlet) {
    event.event_outlet = passed_data.outlet._id;
  }
  
  var created_event = new Event(event);
  created_event.save(function(err, e) {
    if (err || !e) {
      deferred.reject('Could not save the event - ' + JSON.stringify(err));
    } else {
      deferred.resolve(passed_data);
    }
  });

  return deferred.promise;
}