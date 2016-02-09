'use strict';
/*jslint node: true */
var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('underscore');
var ld = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
require('../../models/outlet.mdl');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Account = mongoose.model('Account');
var AuthHelper = require('../../common/auth.hlpr.js');
var logger = require('tracer').colorConsole();
var Transporter = require('../../transports/transporter');
var Agenda = require('agenda');
var agenda = new Agenda({db: {address: 'localhost:27017/retwyst'}});

module.exports.get_outlet = function(id) {
  var deferred = Q.defer();
  Cache.get('outlets', function(err, reply) {
    if (err) {
      deferred.reject('Could not find outlets');
    } else {
      var outlets = JSON.parse(reply);
      if (outlets[id]) {
        deferred.resolve({
          data: outlets[id],
          message: 'Found the outlet'
        });
      } else {
        deferred.reject('Could not find outlet');
      }
    }
  });

  return deferred.promise;
};

module.exports.get_all_outlets = function(token) {
  var deferred = Q.defer();
  logger.log();
  AuthHelper.get_user(token).then(function(data) {
    if(data.data.role>=2) {
      Cache.get('outlets', function(err, reply) {
        if(err || !reply) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t get outlet list'
          });
        } else {
          
          var outlet_ids = _.map(data.data.outlets, function(outlet_id) {
            return outlet_id.toString();
          })
          var outlets = _.filter(JSON.parse(reply), function(outlet) {
            return outlet_ids.indexOf(outlet._id.toString()) !== -1;
          });
          outlets = _.filter(outlets, function(outlet){
            return outlet.outlet_meta.status !== 'archived';
          });
          deferred.resolve({
            data: outlets,
            message: 'Got your outlets'
          });
        }
      });
    } else {
      Cache.get('outlets', function(err, reply) {
        if(err || !reply) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t get outlet list'
          });
        } else {
          var outlets = _.map(JSON.parse(reply), function(obj) {
            return obj; 
          });;
          deferred.resolve({
            data: outlets,
            message: 'Got your outlets'
          });
        }
      });
    }
  });

  return deferred.promise;
};

module.exports.update_outlet = function(token, updated_outlet) {
  var deferred = Q.defer();
  var outlets = [];
  var id = updated_outlet._id;
  delete updated_outlet._id;
  delete updated_outlet.__v;

  AuthHelper.get_user(token).then(function(data) {
    if(data.data.role>5) {
      deferred.reject({
        err: true,
        message: 'Unauthorized access'
      });
    } else if(data.data.role>=2) {
      outlets = (data.data.outlets && data.data.outlets.toString().split(',')) || null;
      if (_.includes(outlets, id)) {
        Outlet.findById(id).exec(function(err, outlet) {
         if (err || !outlet) {
          deferred.reject({
            err: err || true,
            message: "Could not update the outlet"
          });
         } else {
          var outlet = _.extend(outlet, updated_outlet);
          outlet.save(function(err) {
            if(err) {
              deferred.reject({
                err: err || true,
                message: 'Could not update the outlet'
              });
            } else {
              _updateAccountManager(outlet);
              _updateOutletInCache(outlet);
              deferred.resolve({
                data: outlet,
                message: 'Updated outlet successfully'
              });
            }
          });
         }
        });
      } else {
        deferred.reject({
          err: true,
          message: 'No permissions to update the outlet'
        });
      }
    } else {
      console.log(id);
      Outlet.findById(id).exec(function(err, outlet) {
        if(err || !outlet) {
          console.log(err);
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t find the outlet'
          });
        } else {
          outlet = ld.merge(outlet, updated_outlet);
          outlet.basics.is_paying = outlet.basics.is_paying || false;
          outlet.save(function(err) {
            if(err) {
              console.log(err);
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t update the outlet'
              });
            } else {
              _updateAccountManager(outlet);
              _updateOutletInCache(outlet);
              deferred.resolve({
                data: outlet,
                message: 'Updated outlet successfully'
              });
            }
          })
        }
      })
    }
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: 'Couldn\'t find the user'
    });
  });

  return deferred.promise;
};

module.exports.create_outlet = function(token, created_outlet) {
  var deferred = Q.defer();
  var outlet = null;
  AuthHelper.get_user(token).then(function(data) {
    outlet = new Outlet(created_outlet);
    outlet.basics.is_paying = data.data.is_paying;
    
    outlet.save(function(err, o) {
      if (err || !o) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t save the outlet.'
        });
      } else {
        Cache.get('outlets', function(err, reply) {
          if(err) {
            logger.error("Error retrieving outlets for adding new outlet", err);
          } else if(!reply){
                var outlets = {};
                outlets[outlet._id.toString()] = outlet;
                Cache.set('outlets', JSON.stringify(outlets), function(err) {
                  if(err) {
                    logger.error("Error setting updated list of outlets", err);
                  }
                });  
          } else {
            var outlets = JSON.parse(reply);
            outlets[outlet._id.toString()] = outlet;
            Cache.set('outlets', JSON.stringify(outlets), function(err) {
              if(err) {
                logger.error("Error setting updated list of outlets", err);
              }
            });
          }
        });
        _updateAccountManager(outlet);
        User.findOne({
          _id: data.data._id
        }, function(err, user) {
          if (err || !user) {
            deferred.reject({
              err: err || true,
              message: 'Saved the outlet, but couldn\'t set the user.'
            });
          } else {
            user.outlets.push(outlet._id);
            
            user.save(function(err, u) {
              if (err || !u) {
                deferred.reject({
                  err: err || true,
                  message: 'Saved the outlet, but couldn\'t set the user.'
                });
              } else {
                deferred.resolve({
                  data: o,
                  message: 'Successfully created the outlet'
                });
              }
            });
          }
        });
      }
    });
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: 'Couldn\'t find the user'
    });
  });

  return deferred.promise;
};


module.exports.remove_outlet = function(token, outlet_id) {
  var deferred = Q.defer();
  var outlet = null;
  AuthHelper.get_user(token).then(function(data) {
    Outlet.findOneAndRemove({
      _id: outlet_id
    }, function(err, outlet) {
      if (err) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t remove the outlet'
        });
      } else {
        User.findOneAndUpdate({
            _id: data.data._id
          }, {
            $pull: {
              'outlets': outlet_id
            }
          },
          function(err, element) {
            if (err) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t remove the outlet reference from user'
              });
            } else {
              _removeOutletFromCache(outlet_id);
              deferred.resolve({
                data: element,
                message: 'Successfully deleted the outlet'
              });
            }
          });
      }
    });
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: 'Couldn\'t find the user'
    });
  });

  return deferred.promise;
};

var _updateAccountManager = function(outlet) {
    User.find({
        $or: [{
            email: outlet.basics.account_mgr_email,
            role: 2
        }, {
            role: 2,
            outlets: {
                $in: [outlet]
            }
        }, {
          email: {
            $in: ['al@twyst.in', 'rc@twyst.in']
          },
          role: 2
        }]
    }).exec(function(err, account_managers) {
        if (err || !(account_managers && account_managers.length)) {
            logger.error(err && err.stack);
        } else {
            // list of all account to be checked for PUSH
            var set_account_managers = _.filter(account_managers, function(account) {
              return account.email === outlet.basics.account_mgr_email || account.email === 'al@twyst.in' || account.email === 'rc@twyst.in';
            })
            // list of all account to be checked for POP
            var remove_account_managers = _.filter(account_managers, function(account) {
                return account.email !== outlet.basics.account_mgr_email && account.email !== 'al@twyst.in' && account.email !== 'rc@twyst.in';
            });

            _.each(set_account_managers, function(account_obj) {
              var outlet_ids = _.map(account_obj.outlets, function(outlet_id) {
                return outlet_id.toString();
              });
              if (outlet_ids.indexOf(outlet._id.toString()) === -1) {
                account_obj.outlets.push(outlet._id);
                account_obj.save();
              }
            });

            _.each(remove_account_managers, function(account_obj) {
              var outlet_ids = _.map(account_obj.outlets, function(outlet_id) {
                return outlet_id.toString();
              });
              var index = outlet_ids.indexOf(outlet._id.toString());
              if (index !== -1) {
                account_obj.outlets.splice(index, 1);
                account_obj.save();
              }
            });
        }
    });
}



var _updateOutletInCache = function(outlet) {
  Cache.get('outlets', function(err, reply) {
    if(err) {
      logger.error("Error retrieving outlets for update", err);
    } else {
      var outlets = [];
      if(reply) {
        outlets = JSON.parse(reply);
      }
      outlets[outlet._id.toString()] = outlet;
      Cache.set('outlets', JSON.stringify(outlets), function(err) {
        if(err) {
          logger.error("Error updating outlets", err);
        }
      });
    }
  });
}

var _removeOutletFromCache = function(outletId) {
  Cache.get('outlets', function(err, reply) {
    if(err) {
      logger.error("Error retrieving outlets for update", err);
    } else if(reply) {
      var outlets = JSON.parse(reply);
      delete outlets[outletId];
      Cache.set('outlets', JSON.stringify(outlets), function(err) {
        if(err) {
          logger.error("Error updating outlets", err);
        }
      });
    }
  });
}

module.exports.get_orders = function(token, outlet_id) {
  var deferred = Q.defer();
  logger.log();

  AuthHelper.get_user(token).then(function(data) {
    Order.find({
      outlet: outlet_id
    }).populate('user').exec(function(err, orders) {
      if (err) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t get the orders'
        });
      } else {  
        orders = _.map(orders, function(order){
          
          var updated_user = {};
          if(order.user.email) {
            updated_user.email = order.user.email;
          } else if(order.user.google && order.user.google.email) {
            updated_user.email = order.user.google.email;
          } else if(order.user.profile){
            updated_user.email = order.user.profile.email;
          }
          else{
            updated_user.email = 'no email';
          }
          updated_user.first_name = order.user.first_name;
          updated_user.middle_name = order.user.middle_name;
          updated_user.last_name = order.user.last_name;
          updated_user.phone = order.user.phone;
          updated_user._id = order.user._id; 
          order.user = updated_user;
          return order;
        });

        deferred.resolve({
          data: orders,
          message: 'Got your orders'
        });
      }
    });
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: 'Couldn\'t find the user'
    });
  });

  return deferred.promise;
};

module.exports.update_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();

    console.log(order);
    AuthHelper.get_user(token).then(function(data) {
      if(data.data.role < 6) {
        data.order = order;

        if(order.update_type === 'accept') {
          accept_order(data).then(function(data){
            deferred.resolve(data);
          }, function(err) {
            deferred.reject({
              err: err.err || true,
              message: err.message ? err.message : 'Something went wrong'
            });
          })
        } else if(order.update_type === 'reject') {
          reject_order(data).then(function(data){
            deferred.resolve(data);
          }, function(err) {
            deferred.reject({
              err: err.err || true,
              message: err.message ? err.message : 'Something went wrong'
            });
          })
        } else if(order.update_type === 'dispatch') {
          dispatch_order(data).then(function(data){
            deferred.resolve(data);
          }, function(err) {
            deferred.reject({
              err: err.err || true,
              message: err.message ? err.message : 'Something went wrong'
            });
          })
        } else{
          console.log('unknown update');
          deferred.reject({
            err: err.err || true,
            message: err.message ? err.message : 'unknown update type'
          });
        }
      }
      else{
  
        deferred.reject({
          err: true,
          message: 'You are not authorized to update this order'
        });
      }
          
    }, function(err) {
      deferred.reject({
        err: err || true,
        message: 'Couldn\'t find the user'
      });
    });
    
    return deferred.promise;

};

function accept_order(data) {
  logger.log();
  var deferred = Q.defer();

  var current_action = {};
  current_action.action_type = 'ACCEPTED';
  current_action.action_by = data.data._id;
  
  Order.findOneAndUpdate({
      _id: data.order.order_id
    }, {
      $set: {order_status: 'ACCEPTED'},
      $push: {actions: current_action}
    },
    function(err, order) {
      if (err || !order) {
        console.log(err);
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t accept the order'
        });
      } else {
        //notify user/console/am
        //set timeout for assumed delivered state
        send_notification(['console', data.order.am_email.replace('.', '').replace('@', '')], {
          message: 'Order accepted by merchant',
          order_id: data.order.order_id,
          type: 'accept'
        });

        User.findOne({_id: data.order.user._id}, {push_ids: 1}, function(err, user) {
          if (err || !user) {
            deferred.reject({
              err: err || true,
              message: 'Saved the outlet, but couldn\'t set the user.'
            });
          } else {
            var date = new Date();
            var time = date.getTime();
            var notif = {};
            notif.header = 'Order Accepted';
            notif.message = 'Your order has been accepted by merchant';
            notif.state = 'ACCEPTED';
            notif.time = time;
            notif.order_id = data.order.order_id; 

            send_notification_to_user(user.push_ids[user.push_ids.length-1].push_id, notif);
            
            schedule_assumed_delivered(data, user);

            schedule_order_delivered(data, user);
               
            deferred.resolve({
              data: order,
              message: 'order accepted successfully'
            }); 
          }
        });
        
      }
    }
  );
  return deferred.promise;      
}

function reject_order(data) {
  logger.log();
  var deferred = Q.defer();

  var current_action = {};
  current_action.action_type = 'REJECTED';
  current_action.action_by = data.data._id;

  Order.findOneAndUpdate({
      _id: data.order.order_id
    }, {
      $set: {order_status: 'REJECTED'},
      $push: {actions: current_action}
    },
    function(err, order) {
      if (err || !order) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t reject the order'
        });
      } else {
        //notify user/console/am
        send_notification(['console', data.order.am_email.replace('.', '').replace('@', '')], {
          message: 'Order rejected by merchant - ' + data.order.reject_reason,
          order_id: data.order.order_id,
          type: 'reject'
        });

        User.findOne({_id: data.order.user._id}, {push_ids: 1}, function(err, user) {
          if (err || !user) {
            deferred.reject({
              err: err || true,
              message: 'Saved the outlet, but couldn\'t set the user.'
            });
          } else {
            var date = new Date();
            var time = date.getTime();
            var notif = {};
            notif.header = 'Order Rejected';
            notif.message = 'Your order has been rejected by merchant.';
            notif.state = 'REJECTED';
            notif.time = time;
            notif.order_id = data.order.order_id;
            
            send_notification_to_user(user.push_ids[user.push_ids.length-1].push_id, notif);
            
            send_order_reject_sms(user, data.order.order_id);
            deferred.resolve({
              data: order,
              message: 'order rejected successfully'
            });    
          }
        });
        
      }
    }
  );       
  return deferred.promise;  
}

function dispatch_order(data) {
  logger.log();
  var deferred = Q.defer();

  var current_action = {};
  current_action.action_type = 'DISPATCHED';
  current_action.action_by = data.data._id;
  
  
  User.findOne({_id: data.order.user._id}, {push_ids: 1}, function(err, user) {
    if (err || !user) {
      deferred.reject({
        err: err || true,
        message: 'Saved the outlet, but couldn\'t set the user.'
      });
    } 
    else {
      if(data.order.order_status === 'ACCEPTED' || data.order.order_status === 'NOT_DELIVERED'){
        var date = new Date();
        var time = date.getTime();
        var notif = {};
        notif.header = 'Order Dispatched';
        notif.message = 'Your order has been dispatched by merchant';
        notif.state = 'DISPATCHED';
        notif.time = time;
        notif.order_id = data.order.order_id;
        
        send_notification_to_user(user.push_ids[user.push_ids.length-1].push_id, notif);
      }
      Order.findOneAndUpdate({
          _id: data.order.order_id
        }, {
          $set: {order_status: 'DISPATCHED'},
          $push: {actions: current_action}
        },
        function(err, order) {
          if (err || !order) {
            deferred.reject({
              err: err || true,
              message: 'Couldn\'t update the order'
            });
          } else {
            //notify user/console/am       

            send_notification(['console', data.order.am_email.replace('.', '').replace('@', '')], {
              message: 'Order dispatched by merchant',
              order_id: data.order.order_id,
              type: 'dispatch'
            });            

            deferred.resolve({
              data: order,
              message: 'order dispatched successfully'
            });  
                      
          }
        }
      );
    }
  });

   
  return deferred.promise;      
}

function send_notification(paths, payload) {
  logger.log();
  _.each(paths, function(path) {
    Transporter.send('faye', 'faye', {
      path: path, 
      message: payload
    });
  })
}

function send_notification_to_user (gcm_id, notif) {

  var payload = {};   

  payload.head = notif.header;
  payload.body = notif.message;  
  payload.state = notif.state;
  payload.time = notif.time;
  payload.gcms = gcm_id;
  payload.order_id = notif.order_id;

  Transporter.send('push', 'gcm', payload);
       
}

function schedule_assumed_delivered(data, user) {
    logger.log();
    var deferred = Q.defer();

    var Agenda = require('agenda');
    var agenda = new Agenda({db: {address: 'localhost:27017/retwyst'}});

    agenda.define('schedule_assumed_delivered', function(job, done) {            
      Order.findOne({_id: data.order.order_id}).exec(function(err, order) {
          if (err || !order){
              console.log(err);
          } 
          else if(order.order_status === 'ACCEPTED' || order.order_status === 'DISPATCHED'){
            console.log('scheduling assumed delivered')                           
            order.order_status = 'ASSUMED_DELIVERED';
            var current_action = {};
            current_action.action_type = 'ASSUMED_DELIVERED';
            current_action.action_by = 'SYSTEM';
            order.actions.push(current_action);
            order.save(function(err, order){
              console.log('done assumed delivered')                           
              var date = new Date();
              var time = date.getTime();
              var notif = {};
              notif.header = 'Order Recieved';
              notif.message = 'We want to know if your order has been delivered';
              notif.state = 'ASSUMED_DELIVERED';
              notif.time = time;
              notif.order_id = data.order.order_id;
              send_notification_to_user(user.push_ids[user.push_ids.length-1].push_id, notif); 
            })
          }
      })
      
      done();
    });

    agenda.on('ready', function() {
      agenda.schedule('in' +data.order.estimeted_delivery_time + 'minutes', 'schedule_assumed_delivered', {order_id: data.order.order_id, status: 'ASSUMED_DELIVERED', previous_state: 'ACCEPTED'});
      agenda.start();
    });
    
}

function schedule_order_delivered(data, user) {
    logger.log();
    var Agenda = require('agenda');
    var agenda = new Agenda({db: {address: 'localhost:27017/retwyst'}});

    agenda.define('schedule_order_delivered', function(job, done) {            
      Order.findOne({_id: data.order.order_id}).exec(function(err, order) {
        if (err || !order){
            console.log(err);
        } 
        else if(order.order_status === 'ASSUMED_DELIVERED'){                                
          order.order_status = 'DELIVERED';
          var current_action = {};
          current_action.action_type = 'DELIVERED';
          current_action.action_by = 'SYSTEM';
          order.actions.push(current_action);
          order.save(function(err, order){
            var date = new Date();
            var time = date.getTime();
            var notif = {};
            notif.header = 'Order Delivered';
            notif.message = 'Your order has been delivered successfully';
            notif.state = 'DELIVERED';
            notif.time = time;
            notif.order_id = data.order.order_id;
            send_notification_to_user(user.push_ids[user.push_ids.length-1].push_id, notif); 
          })
        }
      })
      
      done();
    });

    agenda.on('ready', function() {
      agenda.schedule('in' +estimeted_delivery_time+20+ 'minutes', 'schedule_order_delivered', {order_id: data.order.order_id, status: 'DELIVERED', previous_state: 'ASSUMED_DELIVERED'});
      agenda.start();
    });
    
}

function send_order_reject_sms(user, order_id) {
    logger.log();
  
    var payload  = {}
    payload.from = 'TWYSTR';
    payload.phone = user.phone;
    payload.message = 'You order order_number('+order_number+')' +'has been rejected by merchant.'
    
    payload.phone = 8130857967//phone.num;
    Transporter.send('sms', 'vf', payload);
    
}