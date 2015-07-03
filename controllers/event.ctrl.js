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
    var deferred = Q.defer();
    var passed_data = data;

    if (!passed_data.req.query.token) {
        deferred.reject("Authentication error - no token passed.");
    }

    if (!passed_data.req.body.event_outlet) {
        deferred.reject('No outlet to log the event at - please pass event_outlet');
    }

    if (!passed_data.req.body.event_type) {
        deferred.reject('No event type - please pass event_type');
    }

    deferred.resolve(passed_data);

    return deferred.promise;
}

function get_user(data) {
    var deferred = Q.defer();
    var passed_data = data;

    var token = data.req.query.token || null;

    AuthHelper.get_user(token).then(function(data) {
        passed_data.user = data.data;
        deferred.resolve(passed_data);
    }, function(err) {
        deferred.reject("Could not find the user for token - " + token);
    });

    return deferred.promise;
}

function get_outlet(data) {
    var deferred = Q.defer();
    var event = {};
    event = _.extend(event, data.req.body);

    var passed_data = data;

    OutletHelper.get_outlet(event.event_outlet).then(function(data) {
        passed_data.outlet = data.data;
        deferred.resolve(passed_data);
    }, function(err) {
        deferred.reject('Could not find the outlet for this id - ' + event.event_outlet);
    });

    return deferred.promise;
}

function create_event(data) {
    var deferred = Q.defer();
    var event = {};
    event = _.extend(event, data.req.body);

    var passed_data = data;
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
        var deferred = Q.defer();
        var passed_data = data;
        var updated_user = data.user;
        var token = data.req.query.token;
        updated_user.following  = updated_user.following || [];
        updated_user.following.push(data.req.body.event_outlet);
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
        'checkin': checkin_processor
    };

    return processors[event_type] || null;
}

function process_event(data) {
    var deferred = Q.defer();
    var passed_data = data;

    var event_type = passed_data.req.body.event_type
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


module.exports.new = function(req, res) {
    var passed_data = {};
    passed_data.req = req;
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

};

module.exports.new_old = function(req, res) {
    var token = req.query.token || null;
    var created_event = {};
    created_event = _.extend(created_event, req.body);

    create_event(res, token, created_event).then(function(data) {
        HttpHelper.success(res, data.data, data.message);
    }, function(err) {
        HttpHelper.error(res, err.data, err.message);
    });
};

module.exports.follow = function(req, res) {
    var token = req.query.token || null;
    var created_event = {};
    created_event = _.extend(created_event, req.body);
    created_event.event_type = 'favourite';

    create_event(res, token, created_event).then(function(data) {
        HttpHelper.success(res, data.data, data.message);
    }, function(err) {
        HttpHelper.error(res, err.data, err.message);
    });
};

module.exports.unfollow = function(req, res) {

};

var create_event2 = function(res, token, created_event) {
    var deferred = Q.defer();
    var event = null;

    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    }

    // CAN THERE BE NON OUTLET SPECIFIC EVENTS?
    if (!created_event.event_outlet) {
        HttpHelper.error(res, true, "No outlet specified");
    } else {
        Outlet.findOne({_id: created_event.event_outlet}, function(err, outlet) {
           if (err || !outlet) {
               HttpHelper.error(res, err || true, "Couldnt find the outlet");
           } else {
               AuthHelper.get_user(token).then(function(data) {
                    var updated_user = data.data;
                   created_event.event_user = updated_user;
                   created_event.event_date = new Date()
                   event = new Event(created_event);
                   event.save(function(err, e) {
                       if (err || !e) {
                           deferred.reject({err: err || true, message: 'Couldn\'t save the event.'});
                       } else {
                           if (created_event.event_type === 'favourite') {
                               // Now, update the user!
                               updated_user.following  = updated_user.following || [];
                               updated_user.following.push(created_event.event_outlet);
                               console.log(updated_user.following);
                               updated_user.following = _.uniq(updated_user.following, false, function(f) {
                                   return f.toString();
                               });
                               console.log(updated_user.following);

                               UserHelper.update_user(token, updated_user).then(function(data) {
                                   deferred.resolve({data: e, message: 'Successfully created the event'});
                               }, function(err) {
                                   deferred.reject();
                               });
                           } else {
                               deferred.resolve({data:'', message:'Successfully created the event'});
                           }
                       }
                   });
               }, function(err) {
                   deferred.reject({err: err || true, message: 'Couldn\'t find the user'});
               });

           }
        });
    }
    return deferred.promise;
};
