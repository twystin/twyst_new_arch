'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Optout = new Schema({
  phone:{type:String},
  blacklisted: {
    reason: {type: String, default: ''},
    when: {type: Date, default: Date.now()},
    is_blacklisted: {type: Boolean, default: false}
  },
  messaging_preferences: {
    block_all: {
      sms: {
        promo: {type: Boolean, default: false},
        trans: {type: Boolean, default: false}
      },
      email: {
        promo: {type: Boolean, default: false},
        trans: {type: Boolean, default: false}
      },
      push: {
        promo: {type: Boolean, default: false},
        trans: {type: Boolean, default: false}
      }
    },
  }
});

module.exports = mongoose.model('Optout', Optout);
