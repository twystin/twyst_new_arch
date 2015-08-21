'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Cache = require('../common/cache.hlpr');

module.exports.new = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, req.body.event_type || ''));
};

module.exports.checkin = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'checkin'));
};

module.exports.gift = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'gift'));
};

module.exports.grab = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'grab'));
};

module.exports.redeem = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'redeem'));
};

module.exports.follow = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'follow'));
};

module.exports.feedback = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'feedback'));
};

module.exports.unfollow = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'unfollow'));
};

module.exports.submit_offer = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'submit_offer'));
};

module.exports.like_offer = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'like_offer'));
};

module.exports.upload_bill = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'upload_bill'));
};

module.exports.share_offer = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'share_offer'));
};

module.exports.share_outlet = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'share_outlet'));
};

module.exports.suggestion = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'suggestion'));
};

module.exports.unlike_offer = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'unlike_offer'));
};

module.exports.extend_offer = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'extend_offer'));
};

module.exports.report_problem = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'report_problem'));
};

module.exports.comments = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'write_to_twyst'));
};

module.exports.generate_coupon = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'generate_coupon'));
};

module.exports.deal_log = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, 'deal_log'));
};

function setup_event(req, type) {
  logger.log();
  var passed_data = {};
  passed_data.event_data = req.body || {};
  passed_data.event_data.event_type = type;
  passed_data.user_token = (req.query && req.query.token) || null;
  passed_data.query_params = req.params || null;
  return passed_data;
}

function create_new(res, passed_data) {
  var HttpHelper = require('../common/http.hlpr.js');

  logger.log();

  basic_checks(passed_data)
    .then(function(data) {
      return get_user(data)
    })
    .then(function(data) {
      return get_outlet(data);
    })
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
      return update_twyst_bucks(data);
    })
    .then(function(data) {
      var bucks = data.user.twyst_bucks;
      var code = data.user.coupons[data.user.coupons.length - 1].code;
      var data = {};
      data.twyst_bucks = bucks;
      data.code = code;

      HttpHelper.success(res, data, "Processed the event successfully.");
    })
    .fail(function(err) {
      console.log(err)
      HttpHelper.error(res, err || false, "Error processing the event");
    });
}

function basic_checks(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  if (!_.get(passed_data, 'user_token')) {
    deferred.reject("Authentication error - no token passed.");
  }

  if (!_.get(passed_data, 'event_data.event_type')) {
    deferred.reject('No event type - please pass event_type');
  }

  deferred.resolve(passed_data);

  return deferred.promise;
}

function get_user(data) {
  var AuthHelper = require('../common/auth.hlpr.js');
  logger.log();

  var deferred = Q.defer();
  var passed_data = data;

  var token = passed_data.user_token || null;

  AuthHelper.get_user(token).then(function(data) {
    passed_data.user = data.data;
    deferred.resolve(passed_data);
  }, function(err) {
    deferred.reject("Could not find the user for token - " + token);
  });

  return deferred.promise;
}

function get_outlet(data) {
  var OutletHelper = require('./helpers/outlet.hlpr.js');
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

  var processors = {
    'follow': require('./processors/follow.proc'),
    'checkin': require('./processors/checkin.proc'),
    'gift': require('./processors/gift.proc'),
    'grab': require('./processors/grab.proc'),
    'redeem': require('./processors/redeem.proc'),
    'unfollow': require('./processors/unfollow.proc'),
    'feedback': require('./processors/feedback.proc'),
    'submit_offer': require('./processors/submit_offer.proc'),
    'like_offer': require('./processors/like_offer.proc'),
    'unlike_offer': require('./processors/unlike_offer.proc'),
    'upload_bill': require('./processors/upload_bill.proc'),
    'share_offer': require('./processors/share_offer.proc'),
    'share_outlet': require('./processors/share_outlet.proc'),
    'suggestion': require('./processors/suggestion.proc'),
    'extend_offer': require('./processors/extend_offer.proc'),
    'report_problem': require('./processors/report_problem.proc'),
    'write_to_twyst': require('./processors/comments.proc'),
    'generate_coupon': require('./processors/generate_coupon.proc'),
    'deal_log': require('./processors/deal_log.proc')

  };

  var deferred = Q.defer();
  var passed_data = data;
  var event_type = passed_data.event_data.event_type;
  var processor = processors[event_type] || null;

  if (!processor) {
    deferred.reject('I don\'t know this type of event - ' + event_type);
  }

  processor.check(passed_data)
    .then(function(data) {
      return processor.process(passed_data);
    })
    .then(function(data) {
      passed_data.user.coupons = data.coupons;
      deferred.resolve(passed_data);
    })
    .fail(function(err) {
      deferred.reject('Could not process the event - ' + err);
    });

  return deferred.promise;
}

function update_outlet_event_analytics(data) {
  var mongoose = require('mongoose');
  require('../models/outlet.mdl.js');
  var Outlet = mongoose.model('Outlet');
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
  var mongoose = require('mongoose');
  require('../models/user.mdl.js');
  var User = mongoose.model('User');
  logger.log()
  var deferred = Q.defer();
  var event_type = data.event_data.event_type;
  var update_total = {
    $inc: {}
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
  var mongoose = require('mongoose');
  require('../models/event.mdl.js');
  var Event = mongoose.model('Event');

  logger.log();

  var deferred = Q.defer();
  var event = {};
  var passed_data = data;

  event = _.extend(event, passed_data.event_data);
  event.event_user = passed_data.user._id;
  if (passed_data.outlet) {
    event.event_outlet = passed_data.outlet._id;
  }

  event.event_date = new Date();
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

function update_twyst_bucks(data) {
  var mongoose = require('mongoose');
  require('../models/user.mdl.js');
  var User = mongoose.model('User');
  logger.log();
  var deferred = Q.defer();
  var event_type = data.event_data.event_type;
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
        if (current_event.event === event_type && current_event.update_now) {
          if (current_event.earn) {
            data.user.twyst_bucks = available_twyst_bucks + current_event.bucks;
          } else {
            data.user.twyst_bucks = available_twyst_bucks - current_event.bucks;
          }

          update_twyst_bucks.$set.twyst_bucks = data.user.twyst_bucks;

          User.findOneAndUpdate({
            _id: data.user._id
          }, update_twyst_bucks, function(err, user) {
            if (err) {
              deferred.reject('Could not update user bucks' + err);
            } else {
              deferred.resolve(data);
            }
          });
        }
      })
      deferred.resolve(data);
    }
  });
  return deferred.promise;
}
