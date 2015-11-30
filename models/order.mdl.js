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
  order_date: {type: Date, default: new Date()},
  order_cost: {type: Number},
  payment_info: {}, //COD/Payu/payment object
  txn_id: {type: String},
  order_status: {type: String},
  items: [{
  	item_id: Schema.ObjectId,
    item_name: {
      type: String
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
    add_on: [{
      add_on_item: {
        type: String
      },
      add_on_item_cost:{
        type: Number
      }   
    }]
        
  }]

})

module.exports = mongoose.model('Order', Order);
