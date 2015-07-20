'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
require('../models/event.mdl.js');
var Event = mongoose.model('Event');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var OutletHelper = require('./helpers/outlet.hlpr.js');
var User = mongoose.model('User');
var logger = require('tracer').colorConsole();
var RecoHelper = require('./helpers/reco.hlpr.js');

var _ = require('underscore');
var Q = require('q');

function check_event(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;

    if (!passed_data.user_token) {
        deferred.reject("Authentication error - no token passed.");
    }

    if (!passed_data.event_data.event_type) {
        deferred.reject('No event type - please pass event_type');
    }

    if (passed_data.event_data && passed_data.event_data.event_type === 'suggestion') {
        if (!passed_data.event_data.event_meta ||
            !passed_data.event_data.event_meta.offer || 
            !passed_data.event_data.event_meta.outlet) {
            deferred.reject('No suggestion information - outlet and offer need to be passed');
        }

    } else {
        if (!passed_data.event_data.event_outlet) {
            deferred.reject('No outlet to log the event at - please pass event_outlet');
        }
    }

    deferred.resolve(passed_data);

    return deferred.promise;
}

function get_user(data) {
    logger.log();

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
    logger.log();

    var deferred = Q.defer();
    var event = {};
    var passed_data = data;
    event = _.extend(event, passed_data.event_data);

    if (event.event_outlet) {
        OutletHelper.get_outlet(event.event_outlet).then(function(data) {
            passed_data.outlet = data.data;
            deferred.resolve(passed_data);
        }, function(err) {
            deferred.reject('Could not find the outlet for this id - ' + event.event_outlet);
        });
    } else {
        deferred.resolve(passed_data);
    }
    
    return deferred.promise;
}

function create_event(data) {
    logger.log();

    var deferred = Q.defer();
    var event = {};
    var passed_data = data;

    event = _.extend(event, passed_data.event_data);
    event.event_user = passed_data.user._id;
    if(passed_data.outlet) {
        event.event_outlet = passed_data.outlet._id;    
    }
    
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
        logger.log();

        var deferred = Q.defer();
        var passed_data = data;
        var updated_user = passed_data.user;
        var token = passed_data.token;

        User.findOneAndUpdate(
            {_id: updated_user._id},
            {$addToSet: {following: passed_data.event_data.event_outlet}},
            function(err, u) {
                if (err) {
                    deferred.reject('Could not update user');
                } else {
                    RecoHelper.cache_user_favourites(updated_user).then(function(data) {
                        deferred.resolve(passed_data);
                    }, function(err) {
                        deferred.reject('Could not update user cache')
                    })
                }
            });

        return deferred.promise;
    }
};

var unfollow_processor = {
    process: function(data) {
        logger.log();

        var deferred = Q.defer();
        var passed_data = data;
        var updated_user = passed_data.user;

        User.findOneAndUpdate(
            {_id: updated_user._id},
            {$pull: {following: passed_data.event_data.event_outlet}},
            function(err, u) {
                if (err) {
                    deferred.reject('Could not update user');
                } else {
                    RecoHelper.cache_user_favourites(updated_user).then(function(data) {
                        deferred.resolve(passed_data);
                    }, function(err) {
                        deferred.reject('Could not update user cache');
                    });
                }
            });

        return deferred.promise;
    }
};

var feedback_processor = {
    process: function(data) {
        logger.log();
        var deferred = Q.defer();
        deferred.resolve(true);
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

var suggestion_processor = {
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
        'unfollow': unfollow_processor,
        'feedback': feedback_processor,
        'suggestion': suggestion_processor
    };

    return processors[event_type] || null;
}

function process_event(data) {
    logger.log();

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
    logger.log();

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
            console.log(err)
            HttpHelper.error(res, err || false, "Error processing the event");
        });
}

module.exports.new = function(req, res) {
    logger.log();

    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;
    create_new(res, passed_data);
};


module.exports.follow = function(req, res) {
    logger.log();

    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.event_data.event_type = 'follow';
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;

    create_new(res, passed_data);

};

module.exports.feedback = function(req, res) {
    logger.log();
    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.event_data.event_type = 'feedback';
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;

    create_new(res, passed_data);
};

module.exports.unfollow = function(req, res) {
    logger.log();

    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.event_data.event_type = 'unfollow';
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;

    create_new(res, passed_data);

};

module.exports.suggestion = function(req, res) {
    logger.log();
    var passed_data = {};

    passed_data.event_data = req.body || {};
    passed_data.event_data.event_type = 'suggestion';
    passed_data.user_token = req.query.token || null;
    passed_data.query_params = req.params || null;

    create_new(res, passed_data);
};
