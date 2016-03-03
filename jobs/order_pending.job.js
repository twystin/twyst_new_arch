'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');

var logger = require('tracer').colorConsole();
var notification = require('../notifications/order_pending.notfn');

var mongoose = require('mongoose');
require('../models/order.mdl')
var Order = mongoose.model('Order');
require('../models/outlet.mdl')
var Outlet = mongoose.model('Outlet');

exports.runner = function(agenda) {
  agenda.define('order_pending', function(job, done) {
    logger.log();
    var date = new Date();
    Order.find({
      'order_status': 'PENDING',
      'order_date': {
        $lt: new Date()
      },
      'notified_am': false
    }).populate('outlet').lean().exec(function(err, orders) {
      if (err || orders.length === 0) {
        console.log(err);        
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
  var what = {
    outlet: order.outlet.basics,
    order_number: order.order_number,
  };
  var user = order.outlet.basics.account_mgr_phone;
  notification.notify(what, null, user, null).then(function(data) {
    logger.log(order._id);

    Order.findOneAndUpdate(
     {
    _id: order._id
    },{
      $set: {'notified_am': true}
    },function(err, order){
      if(err || !order) {
        console.log(err);
      }
      else{
        console.log('ok')
        logger.log();
      }
    })
  }, function(err) {
    logger.log(err);
  });
}
