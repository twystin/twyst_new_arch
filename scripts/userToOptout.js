'use strict';
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/retwyst");

var Optout = require('../models/optout.mdl');
var User = require('../models/user.mdl');
var formatObject = function(user){
  var optout  = {
    phone: "",
    blacklisted: {
      reason: "",
      is_blacklisted: false
    },
    messaging_preferences: {
      block_all: {
        sms: {
          promo: false,
          trans: false
        },
        email: {
          promo: false,
          trans: false
        },
        push: {
          promo: false,
          trans: false
        }
      },
    }
  };

  var temp = optout;
  temp.phone = user.phone;
  if(user.blacklisted === true) {
    temp.blacklisted.is_blacklisted = true;
    temp.blacklisted.reason = user.blacklisted.reason || "";
  } else if(typeof user.blacklisted.is_blacklisted !== undefined && user.blacklisted.is_blacklisted){
    temp.blacklisted.is_blacklisted = true;
    temp.blacklisted.when = user.blacklisted.when;
    temp.blacklisted.reason = user.blacklisted.reason || "";
  } else if(typeof user.blacklisted.is_blacklisted === "undefined" || user.blacklisted.is_blacklisted === null) {
    temp.blacklisted.is_blacklisted = false;
    temp.blacklisted.reason = "";
  }
  if(typeof user.messaging_preferences.block_all.sms.promo !== "undefined" || user.messaging_preferences.block_all.sms.promo !== null) {
    temp.messaging_preferences.block_all.sms.promo = user.messaging_preferences.block_all.sms.promo;
  }
  if(typeof user.messaging_preferences.block_all.sms.trans !== "undefined" || user.messaging_preferences.block_all.sms.trans !== null) {
    temp.messaging_preferences.block_all.sms.trans = user.messaging_preferences.block_all.sms.trans;
  }
  if(typeof user.messaging_preferences.block_all.email.promo !== "undefined" || user.messaging_preferences.block_all.email.promo !== null) {
    temp.messaging_preferences.block_all.email.promo = user.messaging_preferences.block_all.email.promo;
  }
  if(typeof user.messaging_preferences.block_all.email.trans !== "undefined" || user.messaging_preferences.block_all.email.trans !== null) {
    temp.messaging_preferences.block_all.email.trans = user.messaging_preferences.block_all.email.trans;
  }
  if(typeof user.messaging_preferences.block_all.push.promo !== "undefined" || user.messaging_preferences.block_all.push.promo !== null) {
    temp.messaging_preferences.block_all.push.promo = user.messaging_preferences.block_all.push.promo;
  }
  if(typeof user.messaging_preferences.block_all.push.trans !== "undefined" || user.messaging_preferences.block_all.push.trans !== null) {
    temp.messaging_preferences.block_all.push.trans = user.messaging_preferences.block_all.push.trans;
  }
  return temp;
}
var usersArr = User.find({
  $or:[
        {"blacklisted":true},
        {"blacklisted.is_blacklisted": true},
        {"messaging_preferences.block_all.sms.promo": true},
        {"messaging_preferences.block_all.sms.trans": true},
        {"messaging_preferences.block_all.email.promo": true},
        {"messaging_preferences.block_all.email.trans": true},
        {"messaging_preferences.block_all.push.promo": true},
        {"messaging_preferences.block_all.push.trans":true}
      ]
}).select({
    "_id": 0,
    "phone":1,
    "blacklisted": 1,
    "messaging_preferences.block_all":1
  });

usersArr.exec(function(err, users) {
  if(err || !users){
    console.log(err);
  } else {

    var optouts = users.map(formatObject);
    console.log(optouts);
    optouts.forEach(function(optout){
      var optoutMod = new Optout(optout);
      optoutMod.save(formatObject, function(err, data){
        if(err || !data) {
          console.log(err);
        } else {
          console.log("saved", data);
        }
      });
    });
  }
});
