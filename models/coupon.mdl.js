'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
  hours = require("./partials/hours.mdl")

var Coupon = new Schema({
    code: {
        type: String,
        required: true
    },
    outlets: [{
        type: Schema.ObjectId,
        ref: 'Outlet'
    }],
    only_on_first_order: {
        type: Boolean,
        default: false
    },
    max_use_limit: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'multi']
    },
    per_user_limit: {
        type: Number,
        default: 1
    },
    times_used: {
        type: Number,
        default: 0
    },
    validity: {
        start: {
          type: Date,
          default: Date.now
        },
        end: {
          type: Date,
          default: Date.now
        }
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    actions: {
        reward: {
            _id: {
              type: Schema.Types.ObjectId
            }, 
            reward_meta: {}, // only flatoff/percentageoff
            reward_hours: hours.hours,
            applicability: {},
        }
    }
})

module.exports = mongoose.model('Coupon', Coupon);
