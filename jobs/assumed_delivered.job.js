'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/assumed_delivered.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
require('../models/order.mdl');
require('../models/outlet.mdl');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Outlet = mongoose.model('Outlet');

exports.runner = function(agenda) {
    agenda.define('assumed_delivered', function(job, done) {
        logger.log();

        Order.find({
          'order_status': {$in: ['ACCEPTED', 'DISPATCHED']},
        }).populate('outlet user').lean().exec(function(err, orders) {
          if (err || orders.length === 0) {
            done(err || false);
          } else {
            var date = new Date();
            var time = date.getTime();
            orders = _.map(orders, function(order){
                console.log(order.estimeted_delivery_time);
              if(order.order_date <= new Date(time - order.estimeted_delivery_time*60*1000)){
                _.each(order.actions, function(action){
                    if(action.action_type === 'ASSUMED_DELIVERED') {
                        return null;
                    }
                })
                return order;
              }
              else{
                return null;
              }
            })
            orders = _.compact(orders);
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
            current_order.order_status = 'ASSUMED_DELIVERED';
            var current_action = {};
            current_action.action_type = 'ASSUMED_DELIVERED';
            current_action.action_by = '01234567890123456789abcd';
            current_action.message = 'We want to know if your order has been delivered.'
            current_order.actions.push(current_action);

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
                    var account_mgr = order.outlet.basics.account_mgr_phone;
                    var what = {
                        user: order.user.push_ids[order.user.push_ids.length-1].push_id,
                        outlet: order.outlet.basics,
                        order_id: order._id
                    };
                    notification.notify(what, null, user_gcm_id, null).then(function(data) {
                        logger.log(data);
                        }, function(err) {
                        logger.log(err);
                    });
                } 
            })   
        }
        
    });
    
}
