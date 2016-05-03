'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./outlet.mdl');
var hours = require("./partials/hours.mdl");
var Outlet = mongoose.model('Outlet');

var Banner = new Schema({
	banner_type: {type: String}, //third_party,single_outlet,landing_page,multi_outlets
	banner_name: {type: String},
	outlets: [{
        type: Schema.ObjectId,
        ref: 'Outlet'
    }],
	banner_image: {type: String, default: ''},
	coupon_code: String,
	created_date: {
	    type: Date,
	    default: Date.now
	},
	expiry_date: Date,
	header: {
	  type: String
	},
	description: {
		type: String
	}
});

module.exports = mongoose.model('Banner', Banner);
