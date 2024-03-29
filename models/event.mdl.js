'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user.mdl');
require('./outlet.mdl');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');

var Event = new Schema({
  event_type: String,
  event_date: Date,
  event_meta: {},
  event_user: {type: Schema.ObjectId, ref: 'User'},
  event_outlet: {type: Schema.ObjectId, ref: 'Outlet'}
});

module.exports = mongoose.model('Event', Event);
