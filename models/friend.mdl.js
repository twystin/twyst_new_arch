'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var User = require('./user.mdl');

var Friend = new Schema({
	friends: [{
	    source: String,
	    add_date: Date,
	    phone: String,
	    social_id: String,
	    name: String,
	    email: String,
	    gcm_id: String,
	    user: {
	      type: Schema.Types.ObjectId,
	      ref: 'User'
	    }
  	}],
})

module.exports = mongoose.model('Friend', Friend);
