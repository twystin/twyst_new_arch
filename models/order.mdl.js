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
    tag: {type: String}
  },
  outlet: {
    type: Schema.Types.ObjectId,
    ref: 'Outlet'
  },
  order_number: {type: String},
  offer_used: {type: Schema.Types.ObjectId, default: null},
  offer_cost: {type: Number, default: 0},
  order_date: {type: Date, default: Date.now},
  order_value_without_offer: {type: Number, default: 0},
  order_value_with_offer: {type: Number, default: 0},
  tax_paid: {type: Number, default: 0},
  delivery_charge: {type: Number, default: 0},
  packaging_charge: {type: Number, default: 0},
  actual_amount_paid: {type: Number, default: 0},
  cashback: {type: Number, default: 0},
  cod_cashback: {type: Number, default: 0},
  inapp_cashback: {type: Number, default: 0},
  notified_am: {type: Boolean, default: false},
  payment_info: {
    is_inapp: {type: Boolean, default: false},
    payment_mode: {type: String},//COD/Payu/payment object
    payment_method: {type: String}, //card/net banking
    card_id: {type: String}
  }, 
  order_status: {type: String},
  estimeted_delivery_time: {type: String},
  actions: [{
    action_type: {type: String}, //accept/reject/dispatch
    action_by: {type: Schema.Types.ObjectId},
    action_at: {type: Date, default: Date.now},
    message: {type: String}
  }],
  user_feedback: {
    is_ontime: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number
    }
  },
  is_favourite: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String
  },

  items: [{
    menu_id: {type: Schema.Types.ObjectId},  
    category_id: {type: Schema.Types.ObjectId},
    sub_category_id: {type: Schema.Types.ObjectId},
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
    item_rating: {
      type: Number
    },
    option_price_is_additive: {
      type: Boolean,
      default: false,
    },    
    option_is_addon: {
      type: Boolean,
      default: false,
    },
    option_ids: [],
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
    }     
  }]

})

module.exports = mongoose.model('Order', Order);
