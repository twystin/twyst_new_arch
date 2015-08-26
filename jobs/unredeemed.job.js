'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/unredeemed.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
var User = mongoose.model('User');

exports.runner = function(agenda) {
  agenda.define('unredeemed', function(job, done) {
    logger.log();

    User.find({
      coupons: {
        $ne: null
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
  var count = 0;
  _.each(user.coupons, function(coupon) {
    if (!coupon.used_details.used_phone) {
      count = count + 1;
    }
  });
  var what = {
    count: count
  };
  notification.notify(what, null, user, null).then(function(data) {
    logger.log(data);
  }, function(err) {
    logger.log(err);
  });
}
