'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/order_auto_reject.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
require('../models/order.mdl');
require('../models/outlet.mdl');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Outlet = mongoose.model('Outlet');

exports.runner = function(agenda) {
  agenda.define('order_auto_reject', function(job, done) {
    var date = new Date();
    var time = date.getTime();
    logger.log(time);

    Order.find({
      'order_status': 'PENDING',
      'order_date': {
        $lt: new Date(time - 20*60*1000)
      },
      'notified_am': true
    }).populate('outlet user').lean().exec(function(err, orders) {
      if (err || orders.length === 0) {
        done(err || false);
      } else {
        _.each(orders, function(item) {
          process_order(item);
        });
        done();
      }
    });
  });
}

function process_order(order) {
    
    Order.findOne({order_number: order.order_number}).exec(function(err, current_order) {
        if (err || !current_order){
            console.log(err);
        } 
        else {  
            current_order.order_status = 'REJECTED';
            var current_action = {};
            current_action.action_type = 'REJECTED';
            current_action.action_by = '01234567890123456789abcd';
            current_action.message = 'order rejected by merchant.'
            current_order.actions.push(current_action);
            console.log(current_order.actions)
            current_order.save(function(err, updated_order){
                if(err || !updated_order){
                    console.log(err)
                    deferred.reject({
                        err: err || true,
                        message: 'Couldn\'t update this order'
                    });   
                }
                else{
                    var user_gcm_id = order.user.push_ids[order.user.push_ids.length-1].push_id
                    
                    var what = {
                        outlet: order.outlet.basics,
                        order_id: order._id
                    };
                    notification.notify_user(what, null, user_gcm_id, null).then(function(data) {
                        logger.log(data);
                        order.outlet.contact.phones.reg_mobile.forEach(function (phone) {
                            if(phone && phone.num) {
                                notification.notify_merchant(what, null, phone.num, null).then(function(data) {
                                    logger.log(data);
                                    }, function(err) {
                                    logger.log(err);
                                });    
                            }
                        });
                        
                        }, function(err) {
                        logger.log(err);
                    });
                } 
            })   
        }
        
    });
    
}
