'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
	user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  address: {
    line1: {type: String},
    line2: {type: String},
    landmark: {type: String},
    pin: {type: Number}, 
    city: {type: String},
    state: {type: String},
    delivery_zone: {
      type: String
    },
    coords:{
      lat: {type: String},
      long: {type: String}
    },
    tag: {type: String,
      enum: ['home', 'office', 'other']}
  },
  outlet: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet'
  },
  order_number: {type: String},
  offer_used: {type: Schema.Types.ObjectId},
  order_date: {type: Date, default: new Date()},
  order_value_without_offer: {type: Number},
  order_value_with_offer: {type: Number},
  tax_paid: {type: Number},
  actual_amount_paid: {type: Number},
  cashback: {type: Number, default: 0},
  payment_info: {
    is_inapp: {type: Boolean, default: false},
    payment_mode: {type: String},//COD/Payu/payment object
    txn_id: {type: String},
  }, 
  order_status: {type: String},
  estimeted_delivery_time: {type: String},
  actions: [{
    action_type: {type: String}, //accept/reject/dispatch
    action_by: {type: Schema.Types.ObjectId},
    action_at: {type: Date, default: new Date()},
  }],
  user_rating: {
    type: Number,
    default: 0
  },
  is_favourite: {
    type: Boolean,
    default: false
  },
  menu_id: {type: Schema.Types.ObjectId},
  items: [{
    item_name: {
      type: String
    },
    item_quantity: {
      type: Number
    },
    item_description: {
      type: String
    },
    item_photo: {
      type: String
    },
    item_tags: [{
      type: String
    }],
    item_cost: {
      type: String
    },
    option: {
      _id: {type: Schema.Types.ObjectId},
      option_title: {
        type: String
      },
      option_value: {
        type: String
      },
      option_cost: {
        type: Number
      },
      is_vegetarian: false,      
      option_is_addon: {
        type: Boolean,
        default: false,
      },
      sub_options: [{
        sub_option_title: {
          type: String,
        },
        sub_option_set: [{
          sub_option_value: {
            type: String,
          },
          is_available: {
            type: Boolean,
            default: true
          },
          is_vegetarian: {
            type: Boolean,
            default: true
          },
          sub_option_cost: {
            type: Number
          }
        }]
      }],
      addons: [{
        addon_title: {
          type: String,
        },
        addon_set: [{
          addon_value: {
            type: String,
          },
          is_available: {
            type: Boolean,
            default: true
          },
          is_vegetarian: {
            type: Boolean,
            default: true
          },
          addon_cost: {
            type: Number
          }
        }]
      }]
    },    
    
  }]

})

module.exports = mongoose.model('Order', Order);
