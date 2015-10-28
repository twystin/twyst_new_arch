var mongoose = require('mongoose');
var ld = require('lodash');
var json2csv = require('json2csv');
var async = require('async');
var fs = require('fs');

var User = require('../models/user.mdl');
var Account = require('../models/account.mdl');
var Outlet = require('../models/outlet.mdl');

mongoose.connect('mongodb://54.189.82.86/retwyst');
var results = [];
var outlet_ids = [];

Account.find({
    role: 3
}).populate('user', 'is_paying outlets').exec(function(err, accounts) {
    console.log(err);
    async.each(accounts, function(account, callback) {
        Outlet.populate(account, {
            path: 'user.outlets'
        }, function(err, obj) {
            async.each(obj.user.outlets, function(outlet, callback) {
                results.push({
                    merchant_id: account.username,
                    created_on: account.created_at,
                    paying: account.user.is_paying ? 'Y' : 'N',
                    id: outlet._id,
                    outlet: outlet.basics.name,
                    loc1: outlet.contact.location.locality_1[0],
                    loc2: outlet.contact.location.locality_2[0],
                    outlet_status: outlet.outlet_meta.status,
                    outlet_created: outlet.basics.created_at,
                    checkins: ld.filter(outlet.offers, function(offer) {
                        return offer.offer_type == 'checkin'
                    }).length,
                    offer: ld.filter(outlet.offers, function(offer) {
                        return offer.offer_type == 'offer'
                    }).length,
                    deal: ld.filter(outlet.offers, function(offer) {
                        return offer.offer_type == 'deal'
                    }).length,
                    bank_deal: ld.filter(outlet.offers, function(offer) {
                        return offer.offer_type == 'bank_deal'
                    }).length
                });
                callback();
            }, function() {
                callback();
            });
        });
    }, function(err) {
        var fields = Object.keys(results[0]);
        json2csv({ data: results, fields: fields }, function(e, r) {
            console.log(e);
            csv=r;
            fs.writeFile('./report.csv', r, function(err) {
                console.log('errr', err);
                process.exit();
            })
        });
    });
});
