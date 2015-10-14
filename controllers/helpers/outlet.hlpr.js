'use strict';
/*jslint node: true */
var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('underscore');
var ld = require('lodash');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
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
    if(data.data.role>2) {
      User.findOne({
        _id: data.data._id
      }).select('outlets').populate('outlets').exec(function(err, outlets) {
        if (err) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t get the outlets'
          });
        } else {
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
    } else if(data.data.role>2) {
      outlets = (data.data.outlets && data.data.outlets.toString().split(',')) || null;
      if (_.includes(outlets, id)) {
        Outlet.findOneAndUpdate({
            _id: id
          }, {
            $set: updated_outlet
          }, {
            upsert: true
          },
          function(err, o) {
            if (err || !o) {
              logger.log(err);
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t update the outlet'
              });
            } else {
              updated_outlet._id = id;
              _updateOutletInCache(updated_outlet);
              deferred.resolve({
                data: o,
                message: 'Updated outlet successfully'
              });
            }
          }
        );
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
        })
        User.findOne({
          _id: data.data._id
        }, function(err, user) {
          if (err || !user) {
            deferred.reject({
              err: err || true,
              message: 'Saved the outlet, but couldn\'t set the user.'
            });
          } else {
            user.outlets.push(o._id);
            
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