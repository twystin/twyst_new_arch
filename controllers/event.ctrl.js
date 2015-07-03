'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
require('../models/event.mdl.js');
var Event = mongoose.model('Event');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var OutletHelper = require('./helpers/outlet.hlpr.js');
var UserHelper = require('./helpers/user.hlpr.js');
var _ = require('underscore');

var Q = require('q');

function check_event(data) {
    console.log("CHECK EVENT BEGIN");
    var deferred = Q.defer();
    var passed_data = data;

    if (!passed_data.user_token) {
        deferred.reject("Authentication error - no token passed.");
    }

    if (!passed_data.event_data.event_outlet) {
        deferred.reject('No outlet to log the event at - please pass event_outlet');
    }

    if (!passed_data.event_data.event_type) {
        deferred.reject('No event type - please pass event_type');
    }

    deferred.resolve(passed_data);

    return deferred.promise;
}

function get_user(data) {
    console.log("GET USER BEGIN");

    var deferred = Q.defer();
    var passed_data = data;

    var token = passed_data.user_token || null;

    AuthHelper.get_user(token).then(function(data) {
        passed_data.user = data.data;
        deferred.resolve(passed_data);
    }, function(err) {
        deferred.reject("Could not find the user for token - " + token);
    });

    return deferred.promise;
}

function get_outlet(data) {
    console.log("GET OUTLET BEGIN");

    var deferred = Q.defer();
    var event = {};
    var passed_data = data;
    event = _.extend(event, passed_data.event_data);

    OutletHelper.get_outlet(event.event_outlet).then(function(data) {
        passed_data.outlet = data.data;
        deferred.resolve(passed_data);
    }, function(err) {
        deferred.reject('Could not find the outlet for this id - ' + event.event_outlet);
    });

    return deferred.promise;
}

function create_event(data) {
    console.log("CREATE EVENT BEGIN");

    var deferred = Q.defer();
    var event = {};
    var passed_data = data;

    event = _.extend(event, passed_data.event_data);
    event.event_user = passed_data.user._id;
    event.event_outlet = passed_data.outlet._id;
    event.event_date = new Date();
    var created_event = new Event(event);
    created_event.save(function(err, e) {
       if (err || !e) {
           deferred.reject('Could not save the event - ' + JSON.stringify(err));
       } else {
           deferred.resolve(passed_data);
       }
    });

    return deferred.promise;
}

var follow_processor = {
    process: function(data) {
        console.log("FOLLOW PROCESSOR BEGIN");

        var deferred = Q.defer();
        var passed_data = data;
        var updated_user = passed_data.user;

        updated_user.following  = updated_user.following || [];
        updated_user.following.push(passed_data.event_data.event_outlet);
        updated_user.following = _.uniq(updated_user.following, false, function(f) {
            return f.toString();
        });
        UserHelper.update_user(token, updated_user).then(function(data) {
            deferred.resolve(passed_data);
        }, function(err) {
            deferred.reject('Could not update the user: ' + JSON.stringify(err));
        });
        return deferred.promise;
    }
};

var unfollow_processor = {
    process: function(data) {
        console.log("UNFOLLOW PROCESSOR BEGIN");

        var deferred = Q.defer();
        var passed_data = data;
        var updated_user = passed_data.user;

        updated_user.following = updated_user.following || [];
        updated_user.following = _.filter(function(f) {
            return f !==  data.event_data.event_outlet;
        });

        UserHelper.update_user(token, updated_user).then(function(data) {
            deferred.resolve(passed_data);
        }, function(err) {
            deferred.reject('Could not update the user: ' + JSON.stringify(err));
        });
        return deferred.promise;
    }
};

var checkin_processor = {
    process: function(data) {
        var deferred = Q.defer();
        deferred.resolve(true);
        return deferred.promise;
    }
};

function event_processor(event_type) {
    var processors = {
        'follow': follow_processor,
        'checkin': checkin_processor,
        'unfollow': unfollow_processor
    };

    return processors[event_type] || null;
}

function process_event(data) {
    console.log("PROCESS EVENT BEGIN");

    var deferred = Q.defer();
    var passed_data = data;

    var event_type = passed_data.event_data.event_type;

    var processor = event_processor(event_type);

    if (!processor) {
        deferred.reject('I don\'t know this type of event - ' + event_type);
    } else {
        processor.process(passed_data).then(function(data) {
            deferred.resolve(passed_data);
        }, function(err) {
            deferred.reject('Could not process the event');
        });
    }

    deferred.resolve(passed_data);
    return deferred.promise;
}

function create_new(res, passed_data) {
    check_event(passed_data)
        .then(function(data) {
            return get_user(data)
        })
        .then(function(data) {
            return get_outlet(data);
        })
        .then(function(data) {
            return process_event(data);
        })
        .then(function(data) {
            return create_event(data);
        })
        .then(function(data) {
            HttpHelper.success(res, data.outlets, "Processed the event successfully.");
        })
        .fail(function(err) {
            HttpHelper.error(res, err || false, "Error processing the event");
        });
}

module.exports.new = function(req, res) {
    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;
    create_new(res, passed_data);
};


module.exports.follow = function(req, res) {
    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.event_data.event_type = 'follow';
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;

    create_new(res, passed_data);

};

module.exports.unfollow = function(req, res) {

};

