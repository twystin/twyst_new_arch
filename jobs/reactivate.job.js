'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/reactivate.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
require('../models/event.mdl')
var User = mongoose.model('User');
var Event = mongoose.model('Event')

exports.runner = function(agenda) {
  agenda.define('reactivate', function(job, done) {
    logger.log();

    User.find({
      "last_event": {
        "$lt": new Date(2012, 7, 15)
      }
    }).lean().exec(function(err, users) {
      logger.log();
      if (err || users.length === 0) {
        done(err || false);
      } else {
        _.each(users, function(item) {
          process_user(item);
        });
        done();
      }
    });
  });
}

function process_user(user) {
  notification.notify(null, null, user, null).then(function(data) {
    logger.log(data);
  }, function(err) {
    logger.log(err);
  });
}
