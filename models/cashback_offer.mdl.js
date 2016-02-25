'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  hours = require("./partials/hours.mdl")

var CashbackOffer = new Schema({
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
        offer_type: {    ///coupon or gift_card
            type: String
        },
        offer_detail: [{
            egv_id: {
                type: String
            },
            egv_code: {
                type: String
            }
        }],
        offer_logo: {
            type: String
        },
        offer_image: {
            type: String
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
        offer_tnc: {
            type: String
        }, 
        offer_value: {
            type: Number
        },
        min_bill_value: {
            type: Number
        },       
        offer_cost: {
            type: Number
        },
        offer_processing_fee: {
            type: Number
        },
        offer_status: {
            type: String
        },
        offer_start_date: {
            type: Date
        },
        offer_end_date: {
            type: Date
        },
        offer_applicability: hours.hours,
        created_at: {
            type: Date,
            default: Date.now
        },
        created_by: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        last_updated_at: {
            type: Date,
            default: Date.now
        },
        last_updated_by: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }]

})

module.exports = mongoose.model('CashbackOffer', CashbackOffer);
