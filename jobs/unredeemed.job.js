'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var transporter = require('../transports/transporter.js');

require('../models/user.mdl');
var User = mongoose.model('User');

exports.runner = function(agenda) {
  agenda.define('unredeemed', function(job, done) {
    logger.log();
    
    User.find({}).lean().exec(function(err, users) {
    	if (err || users.length === 0) {
    		done(err || false);
    	} else {
    		_.each(users, process_user(item));
    	}
    });
    
    done();
  });
}

function process_user(user) {
	// CHECK IF USER HAS UNUSED COUPONS
	// SEND A MESSAGE IF YES
}