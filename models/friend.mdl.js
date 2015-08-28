'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user.mdl');

var Friend = new Schema({
	friends: [{
	    source: String,
	    add_date: Date,
	    phone: String,
	    name: String,
	    email: String,
	    user: {
	      type: Schema.ObjectId,
	      ref: 'User'
	    }
  	}],
})

module.exports = mongoose.model('Friend', Friend);
