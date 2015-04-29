'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

require('./customer');
var Customer =  mongoose.model('Customer');
var Account = new Schema({
  phone: String,
  customer:{type: Schema.ObjectId, ref:'Customer'},
  created_at: Date
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
