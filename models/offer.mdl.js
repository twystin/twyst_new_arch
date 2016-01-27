'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var hours = require('./partials/hours.mdl').hours;

var Offer = new Schema({
    partner_name: {
        type: String
    },
    contact_person: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    offers: [{
        offer_source: {
            type: String
        },
        offer_type: {
            type: String,
            enum: ['coupon', 'voucher']
        },
        offer_voucher_count: {
            type: Number
        },
        currently_available_voucher_count: {
            type: Number
        },
        offer_text: {
            type: String
        },
        offer_image: {
            type: String
        },
        offer_cost: {
            type: Number
        },
        offer_processing_fee: {
            type: Number
        },
        offer_start_date: {
            type: Date
        },
        offer_end_date: {
            type: Date
        },
        offer_applicability: hours
    }]

})

module.exports = mongoose.model('Offer', Offer);
