'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user.mdl');
require('./outlet.mdl');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');

var Notification = new Schema({
  message : {type: String},
  detail : {type: String},
  icon : {type: String},
  expire : {type: Date},
  shown : {type: Boolean},
  link : {},
  user : {type: Schema.ObjectId, ref: User},
  outlet : {type: Schema.ObjectId, ref: Outlet},
  notification_type: {type: String}, // either push or pull
  created_at: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Notification', Notification);
