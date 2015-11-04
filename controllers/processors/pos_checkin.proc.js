var logger = require('tracer').colorConsole();

var _ = require('lodash');
var Q = require('q');
var CheckinHelper = require('../helpers/checkin.hlpr');
var async = require('async');
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var Outlet = mongoose.model('Outlet');


module.exports.pos_checkin = function(req, res) {
    logger.log();
    var deferred = Q.defer();

    var rows = req.body.rows;
    if(!rows || !rows.length) {
        deferred.reject('nothing to checkin');
    }
    else { 
        rows = _.uniq(rows);    
        async.each(rows, function (phone, callback) {
            var event_data = {};
            event_data.event_meta= {};
            event_data.event_meta.phone = phone;
            event_data.event_meta.date = new Date();
            event_data.event_outlet = req.body.event_outlet;
            console.log(event_data)
            create_new(res, setup_event(event_data, 'pos_checkin'));
            callback();
            
        }, function (err) {
            deferred.resolve(true);
        })
    }
    
    return deferred.promise;
}

function check(data){
    logger.log();
    var deferred = Q.defer();

    CheckinHelper.validate_request(data)
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
}

function process(data) {
    logger.log();
    var deferred = Q.defer();
    CheckinHelper.check_and_create_coupon(data)
        .then(function(data) {
            return CheckinHelper.update_checkin_counts(data);
        })
        .then(function(data) {
            return CheckinHelper.send_sms(data);
        })
        .then(function(data) {
            data.event_data.event_type = 'checkin';
            deferred.resolve(data);
        })
        .fail(function(err) {
            deferred.reject(err);
        })
    return deferred.promise;
}

function setup_event(data, type) {
  logger.log();
  var passed_data = {};
  passed_data.event_data = data || {};
  passed_data.event_data.event_type = type;
  return passed_data;
}

function create_new(res, passed_data) {
    logger.log();
  

  get_outlet(passed_data)
    .then(function(data) {
      return process_event(data);
    })
    .then(function(data) {
      return create_event(data);
    })
    .then(function(data) {
      return update_outlet_event_analytics(data);
    })
    .then(function(data) {
      return update_user_event_analytics(data);
    })
    .then(function(data) {
        
      deferred.resolve();
    })
    .fail(function(err) {
      console.log(err)
      deferred.reject();
    });
}


function get_outlet(data) {
  var OutletHelper = require('../helpers/outlet.hlpr.js');
  logger.log();

  var deferred = Q.defer();
  var event = {};
  var passed_data = data;
  event = _.extend(event, passed_data.event_data);

  if (event.event_outlet) {
    OutletHelper.get_outlet(event.event_outlet).then(function(data) {
      passed_data.outlet = data.data;
      deferred.resolve(passed_data);
    }, function(err) {
      deferred.reject('Could not find the outlet for this id - ' + event.event_outlet);
    });
  } else {
    deferred.resolve(passed_data);
  }

  return deferred.promise;
}

function process_event(data) {
  logger.log();
  var deferred = Q.defer();

  check(data)
    .then(function(data) {
      return process(data);
    })
    .then(function(data) {
      deferred.resolve(data);
    })
    .fail(function(err) {
      console.log(err)
      deferred.reject('Could not process the event - ' + err);
    });

  return deferred.promise;
}

function update_outlet_event_analytics(data) {
  logger.log()
  var deferred = Q.defer();
  var event_type = data.event_data.event_type;
  var update = {
    $inc: {}
  };
  var key = 'analytics.event_analytics.' + event_type;
  update.$inc[key] = 1;
  if (data.outlet) {
    Outlet.findOneAndUpdate({
      _id: data.outlet._id
    }, update, function(err, outlet) {
      if (err) {
        deferred.reject('Could not update outlet analytics' + err);
      } else {
        deferred.resolve(data);
      }
    });
  }

  deferred.resolve(data);
  return deferred.promise;
}

function update_user_event_analytics(data) {
  logger.log()
  var deferred = Q.defer();
  var event_type = data.event_data.event_type;
  var update_total = {
    $inc: {},
    $set : {
     'last_event.when': new Date() 
    }
  };

  var update_total_by_outlet = {
    $inc: {

    }
  }

  var key_total = 'user_meta.total_events.' + event_type;
  update_total.$inc[key_total] = 1;

  if (data.outlet) {
    var key_outlet = 'user_meta.total_events_by_outlet.' + data.outlet._id + '.' + event_type;
    update_total_by_outlet.$inc[key_outlet] = 1;

    User.findOneAndUpdate({
      _id: data.user._id
    }, update_total, function(err, user) {
      if (err) {
        deferred.reject('Could not update user analytics' + err);
      } else {
        User.findOneAndUpdate({
          _id: data.user._id
        }, update_total_by_outlet, function(err, user) {
          if (err) {
            deferred.reject('Could not update user analytics' + err);
          } else {
            deferred.resolve(data);
          }
        });
      }
    });
  }

  deferred.resolve(data);
  return deferred.promise;
}

function create_event(data) {
  logger.log();

  var deferred = Q.defer();
  var event = {};
  var passed_data = data;

  event = _.extend(event, passed_data.event_data);
  event.event_user = passed_data.user._id;

  if (passed_data.outlet) {
    event.event_outlet = passed_data.outlet._id;
  }

  event.event_date = event.event_date || new Date();
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

function process (data) {
    logger.log();
    var deferred = Q.defer();
    
    CheckinHelper.check_and_create_coupon(data)
        .then(function(data) {
            return CheckinHelper.update_checkin_counts(data);
        })
        .then(function(data) {
            return CheckinHelper.send_sms(data);
        })
        .then(function(data) {
            data.event_data.event_type = 'checkin';
            data.event_data.event_meta.event_type = 'panel_checkin';
            deferred.resolve(data);
        })
        .fail(function(err) {
            deferred.reject(err);
        })
    return deferred.promise;
}
