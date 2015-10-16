'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
require('./user.mdl');
var User = mongoose.model('User');

var Account = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    role: {type: Number, default: 6},
    created_at: {type: Date, default: Date.now}
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);