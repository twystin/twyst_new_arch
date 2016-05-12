var mongoose = require('mongoose');
var ld = require('lodash');
var json2csv = require('json2csv');
var async = require('async');
var fs = require('fs');

var User = require('../models/user.mdl');
var Order = require('../models/order.mdl');
var Account = require('../models/account.mdl');
var Outlet = require('../models/outlet.mdl');

mongoose.connect('mongodb://localhost/retwyst');
var results = [];
var outlet_ids = [];

Order.find({'order_status': {$ne: 'checkout'}}).populate('user outlet')
.exec(function(err, orders) {
    console.log(err);
    async.each(orders, function(order, callback) {
        console.log(order.coupon_used);
        if(order.coupon_used) {
            
            results.push({
                user_id: order.user._id,
                trxn_date: order.order_date,
                order_number: order.order_number,                
                total_order_amount: order.actual_amount_paid,
                tax_paid: order.tax_paid,
                order_value_with_offer: order.order_value_with_offer,
                order_value_without_offer: order.order_value_without_offer,
                outlet_name: order.outlet.basics.name,
                loc1: order.outlet.contact.location.locality_1[0],
                loc2: order.outlet.contact.location.locality_2[0],
                commission: order.outlet.twyst_meta.twyst_commission.value,
                payment_mode: order.payment_info.payment_mode,
                coupon_used: order.coupon_used,
                order_status: order.order_status,
                percentage: null,
                cashback: order.cashback
                
            });    
        }
        else{
            var percentage;
            if(order.order_value_with_offer ) {
                percentage = order.cashback*100/order.order_value_with_offer;
            }
            else{
                percentage = order.cashback*100/order.order_value_without_offer;
            }
            results.push({
                user_id: order.user._id,
                trxn_date: order.order_date,
                order_number: order.order_number,                
                total_order_amount: order.actual_amount_paid,
                tax_paid: order.tax_paid,
                order_value_with_offer: order.order_value_with_offer,
                order_value_without_offer: order.order_value_without_offer,
                outlet_name: order.outlet.basics.name,
                loc1: order.outlet.contact.location.locality_1[0],
                loc2: order.outlet.contact.location.locality_2[0],
                commission: order.outlet.twyst_meta.twyst_commission.value,
                payment_mode: order.payment_info.payment_mode,
                coupon_used: null,
                order_status: order.order_status,
                percentage: percentage,
                cashback: order.cashback
                
            });     
        }
        
        callback();
        
    }, function(err) {
        var fields = Object.keys(results[0]);
        json2csv({ data: results, fields: fields }, function(e, r) {
            console.log(e);
            csv=r;
            fs.writeFile('./11_may_order_report.csv', r, function(err) {
                console.log('errr', err);
                process.exit();
            })
        });
    });
});
