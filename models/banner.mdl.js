'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./outlet.mdl');
var hours = require("./partials/hours.mdl");
var Outlet = mongoose.model('Outlet');

var Banner = new Schema({
	banner_type: {type: String}, //third_party_banner,food_banner,landing_page_banner,outlet_banner,
	banner_name: {type: String},
	outlets: [{
        type: Schema.ObjectId,
        ref: 'Outlet'
    }],
	banner_image: {type: String, default: ''},
	cost: {type: Number, default: 0}, // cost in twyst cash
	coupon_code: String,
	max_use: {type: Number, default: 1},	
	end_date: Date,
	header: {
	  type: String
	},
	line1: {
	  type: String
	},
	line2: {
	  type: String
	},
	description: {
	  type: String
	},
	terms: {
	  type: String
	}
});

module.exports = mongoose.model('Banner', Banner);
