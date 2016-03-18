'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var smsRecords = mongoose.createConnection('mongodb://localhost/retwyst_sms_store');

var SentMessage = new Schema({
	receiver: {type: String},
	message: {type: String},
	sending_entity: {type: String},
	sent_at: {type: Date, default: Date.now}
});

module.exports = smsRecords.model('SentMessage', SentMessage);
