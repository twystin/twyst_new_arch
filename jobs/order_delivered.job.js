'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/order_delivered.notfn');

var mongoose = require('mongoose');
require('../models/user.mdl');
require('../models/order.mdl')
var User = mongoose.model('User');
var Order = mongoose.model('Order')

exports.runner = function(agenda) {
  agenda.define('order_auto_reject', function(job, done) {
    logger.log();

    Order.find({
      'order_status': {$in: ['ASSUMED_DELIVERED', 'DISPATCHED']},
      'order_at': {
        $gt: new Date(date.getTime() - 20*60*1000)
      }
    }).populate('outlet user').lean().exec(function(err, orders) {
      logger.log();
      if (err || users.length === 0) {
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
    var action = {};
    action.action_at: Date.now;
    action.action_by: '';
    action.action_name: 'REJECTED';

    Order.update({_id: order._id}, {
        'order_status': 'REJECTED',
        'actions': {$push: action}
    }, {
        multi: true
    }).exec(function (err, num) {
        if(err) {
            console.log(err);
        }
        else{
            var what = {
                outlet: order.outlet.basics,
                order_number: order.order_number
            };
            notification.notify(what, null, user, null).then(function(data) {
                logger.log(data);
                }, function(err) {
                logger.log(err);
            });    
        }
        
    });
    
}
