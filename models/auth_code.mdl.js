'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthCode = new Schema({
  phone: {type: String},
  code: {type: String},
  status: {type: String, enum:['active', 'used']},
  created_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('AuthCode', AuthCode);
