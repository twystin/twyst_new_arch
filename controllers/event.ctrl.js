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

var _ = require('lodash');
var Q = require('q');

module.exports.new = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, req.body.event_type || ''));
};

module.exports.follow = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'follow'));
};

module.exports.feedback = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'feedback'));
};

module.exports.unfollow = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'unfollow'));
};

module.exports.submit_offer = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'submit_offer'));
};

module.exports.like_offer = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'offer_like_event'));
};

module.exports.upload_bill = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'upload_bill'));
};

module.exports.share_offer = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'share_offer'));
};

module.exports.share_outlet = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'share_outlet'));
};

module.exports.suggestion = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'suggestion'));
};

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

function setup_event(req, type) {
    logger.log();
    var passed_data = {};
    passed_data.event_data = req.body || {};
    passed_data.event_data.event_type = type;
    passed_data.user_token = (req.query && req.query.token) || null;
    passed_data.query_params = req.params || null;
    return passed_data;
}

function check_event(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;

    if (!_.get(passed_data, 'user_token')) {
        deferred.reject("Authentication error - no token passed.");
    }

    if (!_.get(passed_data, 'event_data.event_type')) {
        deferred.reject('No event type - please pass event_type');
    }

    var event_type = _.get(passed_data, 'event_data.event_type');
    var offer = _.get(passed_data, 'event_data.event_meta.offer');
    var outlet = _.get(passed_data, 'event_data.event_meta.outlet');
    var location = _.get(passed_data, 'event_data.event_meta.location');
    var photo = _.get(passed_data, 'event_data.event_meta.photo');
    var bill_date = _.get(passed_data, 'event_data.event_meta.bill_date')
    
    if (event_type === 'submit_offer' && (!offer || !outlet || !location)) {
        deferred.reject('Submit offer information needs to have offer, outlet & location at least.');
    }
    else if (event_type === 'suggestion' && (!offer || !location)) {
        deferred.reject('Suggestion information needs to have outlet & location at least.');
    }
    else if((event_type === 'offer_like_event' || event_type === 'share_offer') && (!offer || !outlet)) {
        deferred.reject('No information - outlet and offer need to be passed');
    }
    else if (event_type === 'upload_bill' && (!photo || !bill_date || !outlet)) {
        deferred.reject('No information - outlet, date, photo to be passed');   
    } 
    else if (!passed_data.event_data.event_outlet) {
        deferred.reject('No outlet to log the event at - please pass event_outlet');
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

var submit_offer_processor = {
    process: function(data) {
        var deferred = Q.defer();
        deferred.resolve(true);
        return deferred.promise;
    }
};


var offer_like_processor = {
    process: function(data) {
        logger.log();

        var deferred = Q.defer();
        var passed_data = data;
        var updated_user = passed_data.user;
        var token = passed_data.token;
        Outlet.findOneAndUpdate(
            {_id: passed_data.event_data.event_meta.outlet, 
            offers: {$elemMatch: {'_id': passed_data.event_data.event_meta.offer}}},
            {$addToSet: {'offers.$.offer_likes': updated_user._id}},
            function(err, updated_outlet) {
                if (err) {
                    console.log(err);
                    deferred.reject('Could not update offer');
                } else {             
                    RecoHelper.cache_offer_likes(updated_outlet.offers, passed_data.event_data.event_meta.offer, updated_user._id).then(function(data) {
                        deferred.resolve(passed_data);
                    }, function(err) {
                        deferred.reject('Could not update outlet cache');
                    });                            
                }
            });

        return deferred.promise;
    }
};


var upload_bill_processor = {
    process: function(data) {
        var deferred = Q.defer();
        deferred.resolve(true);
        return deferred.promise;
    }
};

var share_offer_processor = {
    process: function(data) {
        var deferred = Q.defer();
        deferred.resolve(true);

        var passed_data = data;
        var updated_user = passed_data.user;
        var shared_offer = {};
        shared_offer.event_type = passed_data.event_data.event_type;
        shared_offer.event_target = passed_data.event_data.event_meta.offer;

        User.findOneAndUpdate(
            {_id: updated_user},
            {$addToSet: {'user_meta.total_events': shared_offer}},
            function(err, updated_user) {
                if (err) {
                    console.log(err);
                    deferred.reject('Could not update user');
                } else {                                 
                    deferred.resolve(passed_data);
                }
            });
        return deferred.promise;
    }
};

var share_outlet_processor = {
    process: function(data) {
        var deferred = Q.defer();
        deferred.resolve(true);

        var passed_data = data;
        var updated_user = passed_data.user;
        var shared_offer = {};

        shared_offer.event_type = passed_data.event_data.event_type;
        shared_offer.event_target = passed_data.event_data.event_meta.outlet;

        User.findOneAndUpdate(
            {_id: updated_user},
            {$addToSet: {'user_meta.total_events': shared_offer}},
            function(err, updated_user) {
                if (err) {
                    console.log(err);
                    deferred.reject('Could not update user');
                } else {                                 
                    deferred.resolve(passed_data);
                }
            });
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
        'submit_offer': submit_offer_processor,
        'offer_like_event': offer_like_processor,
        'upload_bill': upload_bill_processor,
        'share_offer': share_offer_processor,
        'share_outlet': share_outlet_processor,
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
