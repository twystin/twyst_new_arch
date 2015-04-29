'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./outlet');
var Outlet = mongoose.model('Outlet');
var passportLocalMongoose = require('passport-local-mongoose');

var Customer = new Schema({
  phone: String,
  first_name: String,
  middle_name: String,
  last_name: String,
  email: String,
  gcm: String,
  apple: String,
  bday: {
    d: Number,
    m: Number,
    y: Number
  },
  anniv: {
    d: Number,
    m: Number,
    y: Number
  },
  device: {
    id: String,
    model: String
  },
  location: {
    coords: {
      lat: Number,
      long: Number
    }
  },
  validation: {
    email: Boolean,
    otp: Boolean
  },
  facebook: {},
  acquisition_source: String,
  coupons: [
    {
      code: String,
      outlets: {type: Schema.ObjectId, ref:'Outlet'},
      title: String,
      detail: String,
      expiry: String,
      reward_meta: {},
      used_details: {
        used_time: Date,
        used_by: {type: Schema.ObjectId, ref:'Customer'},
        used_at: {type: Schema.ObjectId, ref:'Outlet'},
        used_phone: String,
      },
      status: String,
      issued: Date,
      redeemed: Date
    }
  ],
  blacklisted: Boolean,
  block: {
    all: {
      sms: Boolean,
      email: Boolean,
      push: Boolean
    },
    outlets: [
      {
        handle: String,
        sms: Boolean,
        email: Boolean,
        push: Boolean
      }
    ]
  },
  friends: [],
  events: [
    {
      event_type: String,
      outlet: String,
      event_date: Date
    }
  ],
  points: Number,
  created_at: Date
});

Customer.plugin(passportLocalMongoose);
module.exports = mongoose.model('Customer', Customer);
