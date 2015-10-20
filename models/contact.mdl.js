'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Contact = new Schema({
	friends: {},
	user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
})

module.exports = mongoose.model('Contact', Contact);
