'use strict';
/*jslint node: true */
var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var AuthHelper = require('../../common/auth.hlpr.js');

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

  AuthHelper.get_user(token).then(function(data) {
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
            deferred.reject({
              err: err || true,
              message: 'Couldn\'t update the outlet'
            });
          } else {
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
    outlet.save(function(err, o) {
      if (err || !o) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t save the outlet.'
        });
      } else {
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


module.exports.retrieve = function(token, outlet_id) {
  var deferred = Q.defer();
  AuthHelper.get_user(token).then(function(data) {
    Outlet.findById(outlet_id)
      .exec(function(err, outlet) {
        if(err || !outlet) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\' find the outlet',
          });
        } else {
          deferred.resolve({
            data: outlet,
            message: 'Successfully retrieved the outlet'
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
}