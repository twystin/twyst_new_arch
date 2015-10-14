var mongoose = require('mongoose');
var ld = require('lodash');
var async = require('async');
var Cache = require('../common/cache.hlpr');

mongoose.connect('mongodb://localhost/retwyst-prod');

var Event = require('../models/event.mdl');
var User = require('../models/user.mdl');

var checkin_map = {};
var errors = [];
var new_map = {};

Event.aggregate([{
    $match: {
        event_type: 'checkin'
    }
}, {
    $group: {
        _id: {
            user: "$event_user",
            outlet: "$event_outlet"
        },
        dates: {
            $push: "$event_date"
        }
    }
}]).exec(function(err, events) {
    console.log(err);
    ld.each(events, function(obj) {
        checkin_map[obj._id.user] = checkin_map[obj._id.user] || {};
        checkin_map[obj._id.user][obj._id.outlet] = checkin_map[obj._id.user][obj._id.outlet] || [];
        checkin_map[obj._id.user][obj._id.outlet] = checkin_map[obj._id.user][obj._id.outlet].concat(obj.dates);
    });
    User.find({
	    role: 3,
	    'outlets.0': {
	        $exists: true
	    }
	}).exec(function(err, merchants) {
	    console.log(err);
	    ld.each(merchants, function(merchant) {
	    	ld.each(merchant.outlets, function(outlet) {
		        ld.each(Object.keys(checkin_map), function(user_id) {
		            new_map[user_id] = new_map[user_id] || {};
		            for (i = 0; i < merchant.outlets.length; i++) {
		                if (checkin_map[user_id][outlet]) {
		                    new_map[user_id][merchant.outlets[i]] = new_map[user_id][merchant.outlets[i]] || [];
		                    new_map[user_id][merchant.outlets[i]] = new_map[user_id][merchant.outlets[i]].concat(checkin_map[user_id][outlet]);
		                }
		            }
		        });
		    });
		});
		async.each(Object.keys(new_map), function(user_id, callback) {
		    Cache.hdel(user_id, 'checkin_map', function(err) {
		        if (err) {
		            console.log(err);
		        }
		        Cache.hset(user_id, 'checkin_map', JSON.stringify(new_map[user_id]), function(err) {
		            if (err) {
		                console.log(err);
		            }
		            callback();
		        });
		    });
		}, function() {
			process.exit();
		});
	})
});







