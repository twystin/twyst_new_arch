'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
require('../models/event.mdl.js');
var Event = mongoose.model('Event');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var OutletHelper = require('./helpers/outlet.hlpr.js');
var User = mongoose.model('User');
var logger = require('tracer').colorConsole();
var RecoHelper = require('./helpers/reco.hlpr.js');

var _ = require('lodash');
var Q = require('q');

module.exports.new = function(req, res) {
  logger.log();
  create_new(res, setup_event(req, req.body.event_type || ''));
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
  create_new(res, setup_event(req, 'offer_like_event'));
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
      HttpHelper.success(res, data.outlets, "Processed the event successfully.");
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
  var passed_data = data;

  var event_type = passed_data.event_data.event_type;
  var processor = event_processor(event_type);

  if (!processor) {
    deferred.reject('I don\'t know this type of event - ' + event_type);
  }

  processor.check(passed_data)
    .then(function(data) {
      return processor.process(passed_data);
    })
    .then(function(data) {
      deferred.resolve(passed_data);
    })
    .fail(function(err) {
      deferred.reject('Could not process the event - ' + err);
    });

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

function event_processor(event_type) {
  var processors = {
    'follow': require('./processors/follow'),
    'checkin': require('./processors/checkin'),
    'unfollow': require('./processors/unfollow'),
    'feedback': require('./processors/feedback'),
    'submit_offer': require('./processors/submit_offer'),
    'offer_like_event': require('./processors/offer_like'),
    'upload_bill': require('./processors/upload_bill'),
    'share_offer': require('./processors/share_offer'),
    'share_outlet': require('./processors/share_outlet'),
    'suggestion': require('./processors/suggestion')
  };

  return processors[event_type] || null;
}