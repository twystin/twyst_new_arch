var ld = require('lodash');
var mongoose = require('mongoose');
var Outlet = require('./models/outlet.mdl');
mongoose.connect('mongodb://localhost/retwyst');

Outlet.find({}).exec(function(err, outlets) {
    if (err) {
        console.log(err);
    } else {
        var original_outlets = ld.indexBy(outlets, '_id');
        mongoose.disconnect();
        mongoose.connect('mongodb://localhost/retwyst_dummy');
        Outlet.find({}).exec(function(err, outlets) {
            if (err) {
                console.log(err);
            } else {
                var new_outlets = ld.indexBy(outlets, '_id');
                ld.each(Object.keys(original_outlets), function(outlet_id) {
                    var outlet = new_outlets[outlet_id];
                    console.log(outlet ? 'outlet' : 'undefined');
                    if (outlet) {
                        for (var i = 0; i < original_outlets[outlet_id].offers.length; i++) {
                            if (outlet.offers[i]) {
                            	console.log('offer');
                                outlet.offers[i]._id = original_outlets[outlet_id].offers[i]._id;
                            }
                        }
                        outlet.save(function(err) {
                            if(err) {
                            	console.log(err);
                            }
                        });
                    }
                });
            }
        });
    }
});