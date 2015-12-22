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
    tags: {type: String,
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
  cash_back: {type: Number},
  payment_info: {}, //COD/Payu/payment object
  txn_id: {type: String},
  order_status: {type: String},
  is_favourite: {
    type: Boolean,
    default: false
  },
  items: [{
  	item_id: Schema.ObjectId,
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
      type: String 
    },
    option_cost: {
      type: Number
    },
    sub_options: [{
      _id: {
        type: Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
      },
      sub_option_title: {
        type: String,
      },
      sub_option_set: [{
        sub_option_value: {
          type: String,
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
      _id: {
        type: Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
      },
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
  }]

})

module.exports = mongoose.model('Order', Order);
