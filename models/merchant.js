'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Merchant = new Schema({
  name: String,
  email: String,
  role: {type: Number, enum:[1,2,3,4,5]},
  contact: String,
  company: String,
  address: String,
  phone: String
});

Merchant.plugin(passportLocalMongoose);
module.exports = mongoose.model('Merchant', Merchant);
