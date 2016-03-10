'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SentMessage = new Schema({
	receiver: {type: String},
	message: {type: String},
	sending_entity: {type: String},
	sent_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('SentMessage', SentMessage);
