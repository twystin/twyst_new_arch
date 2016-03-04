'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./outlet.mdl');
require('./friend.mdl');
var Outlet = mongoose.model('Outlet');
var Friend = mongoose.model('Friend');

var User = new Schema({
  activities: [],
  contact_person: {type: String, default: ''},
  is_paying: {type: Boolean, default: false },
  company_name: {type: String, default: ''},
  job_title: {type: String, default: ''},
  website: {type: String, default: ''},
  phone: {type: String, default: ''},
  first_name: {type: String, default: ''},
  middle_name: {type: String, default: ''},
  last_name: {type: String, default: ''},
  email: {type: String, default: ''},
  address: [{ 
    line1: {type: String},
    line2: {type: String},
    landmark: {type: String},
    city: {type: String},
    state: {type: String},
    coords:{
      lat: {type: String},
      long: {type: String}
    },
    tag: {type: String},
    added_at: {
      type: Date, 
      default: Date.now
    }
  }],
  twyst_cash: {
    type: Number,
    default: 0,
    required: true
  },
  image: {type: String, default: ''},
  push_ids: [{
    push_type: {type: String, default: ''}, // enum
    push_id: {type: String, default: ''},
    push_meta: {}
  }],
  life_events: [{
    event_type: {type: String, default: ''}, // enum
    event_meta: {},
    event_date: {
      d: Number,
      m: Number,
      y: Number
    }
  }],
  device_info: {
    id: {type: String, default: ''},
    model: {type: String, default: ''},
    os: {type: String, default: ''}  
  },
  locations: {
    location_type: {type: String, default: ''}, // home, office, last, most_often, favourite
    coords: {
      lat: Number,
      long: Number
    },
    name: {type: String, default: ''},
    when: Date
  },
  validation: {
    email: Boolean,
    sent_email_count: { type: Number, default: 0},
    otp: Boolean
  },
  user_acquisition_source: {type: String, default: ''},
  app_acquisition_source: {type: String, default: ''},
  last_event: {
    from: {type: String, default: ''},
    when: Date
  },
  facebook: {},
  google: {},
  blacklisted: {
    reason: {type: String, default: ''},
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
        ref: 'Outlet'
      },
      handle: {type: String, default: ''},
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
  orders: [{
    type: Schema.ObjectId,
    ref: 'Order'
  }],
  coupons: [{
    _id: Schema.ObjectId,
    code: {type: String, default: ''},
    issued_for: {
      type: Schema.ObjectId
    },
    issued_by: {
      type: Schema.ObjectId,
      ref: 'Outlet'
    },
    coupon_source: {type: String, default: ''},
    lapsed_coupon_source: {},
    is_grabbed: {type: Boolean, default: false},
    header: {type: String, default: ''},
    line1: {type: String, default: ''},
    line2: {type: String, default: ''},
    description: {type: String, default: ''},
    lapse_date: Date,
    expiry_date: Date,
    coupon_valid_days: Number,
    meta: {
      reward_type: {
        type: {type: String, default: ''}      }
    },
    used_details: {
      used_time: Date,
      used_by: {
        type: Schema.ObjectId,
        ref: 'User'
      },
      used_at: {
        type: Schema.ObjectId,
        ref: 'Outlet'
      },
      used_phone: {type: String, default: ''}    },
    status: {type: String, default: ''},
    actions: {
      action_type: {type: String, default: ''}, // gift, share
      action_source: {
        type: Schema.ObjectId,
        ref: 'User'
      },
      action_destination: {
        type: Schema.ObjectId,
        ref: 'User'
      }
    },
    outlets: [{
      type: Schema.ObjectId,
      ref: 'Outlet'
    }],
    issued_at: Date
  }],
  shopping_coupon: [{
    source: String,
    offer_id: String
  }],
  friends: {
    type: Schema.ObjectId,
    ref: 'Friend'
  },
  user_meta: {
    calculated_cuisines: [],
    calculated_restaurant_types: [],
    calculated_attributes: [],
    total_events: {},
    total_events_by_outlet: {}
  },
  role: {
    type: Number,
    default: 6
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', User);
