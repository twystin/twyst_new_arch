'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./outlet.mdl');
var hours = require("./partials/hours.mdl");
var Outlet = mongoose.model('Outlet');

var PromoNotification = new Schema({
	notification_type: {type: String}, //third_party,single_outlet,multi_outlets,landing_page
	notification_name: {type: String},
	outlets: [{
        type: Schema.ObjectId,
        ref: 'Outlet'
    }],
	notification_image: {type: String, default: ''},
	coupon_code: String,
	end_date: Date,
	header: {
	  type: String
	},
	description: {
		type: String
	}
});

module.exports = mongoose.model('PromoNotification', PromoNotification);
