'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var smsRecords = mongoose.createConnection('mongodb://localhost/retwyst_sms_store');

var SentMessage = new Schema({
	phone: {type: String},
	message: {type: String},
	sender: {type: String},
	sent_at: {type: Date, default: Date.now}
});

module.exports = smsRecords.model('SentMessage', SentMessage);
