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
            process_user(item)
        });
        done();
      }
    });
  });
}

function process_user(user) {
  // CHECK IF USER HAS UNUSED COUPONS
  // SEND A MESSAGE IF YES
  // var count = 0;
  var what = {count:1};
  // var what.count = count;
  // notification.notify(what, null, user, null);
  _.each(user.coupons, function(coupon) {
    if (!coupon.used_details.used_phone) {
      notification.notify(what, null, user, null);
      //logger.log("Notify this user - " + user._id);
    }
  })
}
