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
          });;
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
              _updateAccountManage(outlet);
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
              _updateAccountManage(outlet);
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
          }
          else if(!reply){
                var outlets = {};
                outlets[outlet._id.toString()] = outlet;
                Cache.set('outlets', JSON.stringify(outlets), function(err) {
                  if(err) {
                    logger.error("Error setting updated list of outlets", err);
                  }
                });  
          }
           else {
            var outlets = JSON.parse(reply);
            outlets[outlet._id.toString()] = outlet;
            Cache.set('outlets', JSON.stringify(outlets), function(err) {
              if(err) {
                logger.error("Error setting updated list of outlets", err);
              }
            });
          }
        });
        
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

var _updateAccountManage = function(outlet) {
    User.find({
        $or: [{
            email: outlet.basics.account_mgr_email,
            role: 2
        }, {
            role: 2,
            outlets: {
                $in: [outlet]
            }
        }]
    }).exec(function(err, account_managers) {
        if (err || !(account_managers && account_managers.length)) {
            logger.error(err && err.stack);
        } else {
            var new_account_manager = _.findWhere(account_managers, function(account) {
                return user.email === outlet.basics.account_mgr_email;
            });
            var old_account_manager = _.findWhere(account_managers, function(account) {
                return user.email !== outlet.basics.account_mgr_email;
            });
            if (old_account_manager) {
                old_account_manager.outlets = _.filter(old_account_manager.outlets, function(outlet_id) {
                    return outlet._id.toString() !== outlet._id.toString();
                });
                old_account_manager.save();
            }

            if (new_account_manager) {
                new_account_manager.outlets.push(outlet._id);
                new_account_manager.save();
            }
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
      } 
      else {  
        orders = _.map(orders, function(order){
          
          var updated_user = {};
          if(order.user.email) {
            updated_user.email = order.user.email;
          }
          else if(order.user.google && order.user.google.email) {
            updated_user.email = order.user.google.email;
          }
          else {
            updated_user.email = order.user.profile.email;
          }
          updated_user.first_name = order.user.first_name;
          updated_user.middle_name = order.user.middle_name;
          updated_user.last_name = order.user.last_name;
          updated_user.phone = order.user.phone; 
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

    AuthHelper.get_user(token).then(function(data) {
      if(data.data.role < 6) {
        data.order = order;

        if(order.update_type === 'accept') {
          accept_order(data).then(function(data){
            deferred.resolve(data);
          })
        }
        else if(order.update_type === 'reject') {
          reject_order(data).then(function(data){
            deferred.resolve(data);
          })
        }
        else if(order.update_type === 'dispatch') {
          dispatch_order(data).then(function(data){
            deferred.resolve(data);
          })
        }
        else{
          console.log('unknown update');
          //unknown update
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
  current_action.action_type = 'accepted';
  current_action.action_by = data.data._id;
  
  console.log(data.order);
  Order.findOneAndUpdate({
      _id: data.order.order_id
    }, {
      $set: {order_status: 'accepted'},
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

        deferred.resolve({
          data: order,
          message: 'order accepted successfully'
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
  current_action.action_type = 'rejected';
  current_action.action_by = data.data._id;

  Order.findOneAndUpdate({
      _id: data.order.order_id
    }, {
      $set: {order_status: 'rejected'},
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

        deferred.resolve({
          data: order,
          message: 'order rejected successfully'
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
  current_action.action_type = 'dispatched';
  current_action.action_by = data.user._id;

  Order.findOneAndUpdate({
      _id: order.order_id
    }, {
      $set: {order_status: 'dispatched'},
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

        deferred.resolve({
          data: order,
          message: 'order updated successfully'
        });
      }
    }
  );       
}

