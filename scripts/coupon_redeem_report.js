var mongoose = require('mongoose');
var ld = require('lodash');
var json2csv = require('json2csv');
var async = require('async');
var fs = require('fs');

var User = require('../models/user.mdl');
var Account = require('../models/account.mdl');
var Outlet = require('../models/outlet.mdl');
var Events = require('../models/event.mdl');

mongoose.connect('mongodb://localhost/retwyst');
var results = [];
var outlet_ids = [];

Events.find({
    event_type: 'redeem',
    event_date: {$gte: new Date('09/27/2015')}

}).populate('event_outlet event_user').exec(function(err, events) {
    console.log(err);
    
    async.each(events, function(event, callback) {
       if(event.event_outlet) {
            results.push({
                phone: event.event_user.phone,
                date: event.event_date,
                outlet: event.event_outlet.basics.name,
                loc1: event.event_outlet.contact.location.locality_1[0],
                loc2: event.event_outlet.contact.location.locality_2[0],
            });
       }
        
        callback();
    }, function(err) {
        var fields = Object.keys(results[0]);
        json2csv({ data: results, fields: fields }, function(e, r) {
            console.log(e);
            csv=r;
            fs.writeFile('./redeem.csv', r, function(err) {
                console.log('errr', err);
                process.exit();
            })
        });
    });
});
