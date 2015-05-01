'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('./account');
require('./customer');
var Account =  mongoose.model('Account');
var Customer = mongoose.model('Customer');
var Merchant = mongoose.model('Merchant');

var AuthToken = new Schema({
  token: String,
  expiry: Date,
  user_type: String,
  account: {type: Schema.ObjectId, ref:Account},
  customer: {type: Schema.ObjectId, ref:Customer},
  merchant: {type: Schema.ObjectId, ref:Merchant}
});

module.exports = mongoose.model('AuthToken', AuthToken);
