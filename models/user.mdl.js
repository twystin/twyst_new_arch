'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./outlet.mdl');
var Outlet = mongoose.model('Outlet');

var User = new Schema({
  activities: [],
  contact_person: String,
  company_name: String,
  job_title: String,
  website: String,
  phone: String,
  first_name: String,
  middle_name: String,
  last_name: String,
  email: String,
  address: String,
  push_ids: [{
    push_type: String, // enum
    push_id: String,
    push_meta: {}
  }],
  life_events: [{
    event_type: String, // enum
    event_meta: {},
    event_date: {
      d: Number,
      m: Number,
      y: Number
    }
  }],
  device: {
    id: String,
    model: String,
    os: String
  },
  locations: [{
    location_type: String, // home, office, last, most_often, favourite
    coords: {
      lat: Number,
      long: Number
    },
    name: String,
    when: Date
  }],
  validation: {
    email: Boolean,
    otp: Boolean
  },
  user_acquisition_source: String,
  app_acquisition_source: String,
  last_logged_in: {
    from: String,
    when: Date
  },
  facebook: {},
  google: {},
  blacklisted: {
    reason: String,
    when: Date,
    is_blacklisted: Boolean
  },
  messaging_preferences: {
    block_all: {
      sms: {
        promo: Boolean,
        trans: Boolean
      },
      email: {
        promo: Boolean,
        trans: Boolean
      },
      push: {
        promo: Boolean,
        trans: Boolean
      }
    },
    block_outlets: [{
      outlet_id: {
        type: Schema.ObjectId,
        ref: Outlet
      },
      handle: String,
      sms: {
        promo: Boolean,
        trans: Boolean
      },
      email: {
        promo: Boolean,
        trans: Boolean
      },
      push: {
        promo: Boolean,
        trans: Boolean
      }
    }]
  },
  outlets: [{
    type: Schema.ObjectId,
    ref: 'Outlet'
  }],
  following: [{
    type: Schema.ObjectId,
    ref: 'Outlet'
  }],
  coupons: [{
    _id: Schema.ObjectId,
    code: String,
    outlets: [{
      type: Schema.ObjectId,
      ref: 'Outlet'
    }],
    coupon_source: {
      type: String
    },
    header: String,
    line1: String,
    line2: String,
    lapse_date: Date,
    expiry_date: Date,
    meta: {
      reward_type: {
        type: String
      }
    },
    used_details: {
      used_time: Date,
      used_by: {
        type: Schema.ObjectId,
        ref: 'Customer'
      },
      used_at: {
        type: Schema.ObjectId,
        ref: 'Outlet'
      },
      used_phone: String
    },
    status: String,
    actions: {
      action_type: String, // gift, share
      action_source: {
        type: Schema.ObjectId,
        ref: 'Customer'
      },
      action_destination: {
        type: Schema.ObjectId,
        ref: 'Customer'
      }
    },
    issued_at: Date
  }],
  friends: [{
    friend_source: String,
    friend_add_date: Date,
    friend: {
      type: Schema.ObjectId,
      ref: 'Customer'
    }
  }],
  user_meta: {
    calculated_cuisines: [],
    calculated_restaurant_types: [],
    calculated_attributes: [],
    total_events: {},
    total_events_by_outlet: {}
  },
  points: Number,
  created_at: Date
});

module.exports = mongoose.model('User', User);
