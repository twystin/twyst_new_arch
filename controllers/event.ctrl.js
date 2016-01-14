'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Cache = require('../common/cache.hlpr');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Outlet = mongoose.model('Outlet');
var Event = mongoose.model('Event');
var HttpHelper = require('../common/http.hlpr');
var AuthHelper = require('../common/auth.hlpr');
var EventHelper = require('./helpers/event.hlpr');

module.exports.new = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, req.body.event_type || ''));
};

module.exports.qr_checkin = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'qr_checkin'));
};

module.exports.panel_checkin = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'panel_checkin'));
}

module.exports.gift = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'gift'));
};

module.exports.grab = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'grab'));
};

module.exports.redeem = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'redeem'));
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
    create_new(res, setup_event(req, 'like_offer'));
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

module.exports.unlike_offer = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'unlike_offer'));
};

module.exports.extend_offer = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'extend_offer'));
};

module.exports.report_problem = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'report_problem'));
};

module.exports.request_menu_update = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'menu_update'));
}

module.exports.comments = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'write_to_twyst'));
};

module.exports.generate_coupon = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'generate_coupon'));
};

module.exports.deal_log = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'deal_log'));
};

module.exports.referral_join = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'referral_join'));
};

module.exports.bulk_checkin = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'bulk_checkin'));
};

module.exports.mrl_checkin = function(req, res) {
    logger.log();
    create_new(res, setup_event(req, 'mrl_checkin'));
};

module.exports.list_events = function(req, res) {
    logger.log();
    var token = req.query.token || null;
    var event_type = req.params.event_type;

    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    } else {
        AuthHelper.get_user(token).then(function(data) {
            var user = data.data;
            EventHelper.get_event_list(user, event_type).then(function(data) {
                HttpHelper.success(res, data.data, data.message);
            }, function(err) {
                HttpHelper.error(res, err.err, err.message);
            });
        }, function(err) {
            HttpHelper.error(res, err, "Could not find user");
        });
    }
}

module.exports.list_bills = function(req, res) {
    logger.log();
    var token = req.query.token || null;
    var status = req.query.status || 'Pending';
    var sort = req.query.sort || 'event_date'

    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    } else {
        AuthHelper.get_user(token).then(function(data) {
            var user = data.data;
            EventHelper.get_upload_bills(user, status, sort).then(function(data) {
                HttpHelper.success(res, data.data, data.message);
            }, function(err) {
                HttpHelper.error(res, err.err, err.message);
            });
        }, function(err) {
            HttpHelper.error(res, err, "Could not find user");
        });
    }
}

module.exports.get_event = function(req, res) {
    logger.log();
    var HttpHelper = require('../common/http.hlpr.js');
    var AuthHelper = require('../common/auth.hlpr.js');
    var EventHelper = require('./helpers/event.hlpr.js');
    var token = req.query.token || null;
    var event_id = req.params.event_id || null;

    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    } else if (!event_id) {
        HttpHelper.error(res, null, "Event ID is invalid/missing");
    } else {
        AuthHelper.get_user(token).then(function(data) {
            var user = data.data;
            EventHelper.get_event(user, event_id).then(function(data) {
                HttpHelper.success(res, data.data, data.message);
            }, function(err) {
                HttpHelper.error(res, err.err, err.message);
            })
        }, function(err) {
            HttpHelper.error(res, err, "Could not find user");
        })
    }
}

module.exports.update_event = function(req, res) {
    logger.log();
    var HttpHelper = require('../common/http.hlpr.js');
    var AuthHelper = require('../common/auth.hlpr.js');
    var EventHelper = require('./helpers/event.hlpr.js');
    var token = req.query.token || null;
    var event_id = req.params.event_id || null;
    var event = {};
    event = _.extend(event, req.body);

    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    } else if (!event_id) {
        HttpHelper.error(res, null, "Event ID is invalid/missing");
    } else if (!Object.keys(event).length) {
        HttpHelper.error(res, null, "Request invalid");
    } else {
        AuthHelper.get_user(token).then(function(data) {
            var user = data.data;
            EventHelper.update_event(user, event).then(function(data) {
                HttpHelper.success(res, data.data, data.message);
            }, function(err) {
                HttpHelper.error(res, err.err, err.message);
            })
        }, function(err) {
            HttpHelper.error(res, err || false, "Could not find user");
        });
    }
}

module.exports.contact_us = function(req, res) {
    logger.log();
    var Mailer = require('../transports/email/gmail.transport');
    if (!req.body.name) {
        HttpHelper.error(res, null, "Name required");
    } else if (!req.body.email) {
        HttpHelper.error(res, null, "Email ID required");
    } else if (!req.body.comments) {
        HttpHelper.error(res, null, "Comments cannot be left blank.");
    } else {
        Mailer.send({
            from: 'contactus@twyst.in',
            to: 'hemant@twyst.in, kuldeep@twyst.in, al@twyst.in, rc@twyst.in',
            subject: 'Contact Us Submittion',
            text: "From: " + req.body.name + "\nE-Mail: " + req.body.email + "\nRemarks: " + req.body.comments,
            html: "<h4>From</h4>" + req.body.name + "<h4>E-Mail</h4>" + req.body.email + "<h4>Remarks</h4>" + req.body.comments,
        }).then(function(reply) {
            console.log('main reply', reply);
            HttpHelper.success(res, null, "Thank you for reaching out. We'll get back with you shortly.");
        }, function(err) {
            console.log('mail failed', err);
            HttpHelper.error(res, error || null, "Something went wrong. Please try after sometime.");
        });
    }
}

module.exports.apply = function(req, res) {
    logger.log();
    var AWSHelper = require('./helpers/aws.hlpr.js');
    var Mailer = require('../transports/email/gmail.transport');
    var formats = require('../common/fileformats.js').file_formats;
    if (!req.body.position) {
        HttpHelper.error(res, null, 'Please specify the position');
    } else if (!req.body.resume) {
        HttpHelper.error(res, null, "Resume file required");
    } else if (!req.body.format) {
        HttpHelper.error(res, null, "file format required");
    } else {
        var buff = new Buffer(req.body.resume.replace(/^data:application\/\w+;base64,/, ''), 'base64');
        var timestamp = Date.now();

        Mailer.send({
            from: 'apply@twyst.in',
            to: 'hemant@twyst.in, kuldeep@twyst.in, al@twyst.in, rc@twyst.in',
            subject: 'Candidate Application (' + req.body.position + ')',
            text: 'New job application',
            html: 'New job application',
            attachments: [{
                filename: 'resume' + formats[req.body.format],
                content: buff
            }]
        }).then(function(reply) {
            HttpHelper.success(res, null, "Application submitted. We will get back shortly");
        }, function(err) {
            console.log('mail failed', err);
            HttpHelper.error(res, null, "something went wrong. Please try after sometime.");
        });
    }
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

function create_new(res, passed_data) {
    var HttpHelper = require('../common/http.hlpr.js');

    basic_checks(passed_data)
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
            return update_outlet_event_analytics(data);
        })
        .then(function(data) {
            return update_user_event_analytics(data);
        })
        .then(function(data) {
            return update_twyst_bucks(data);
        })
        .then(function(data) {
            if (data && data.event_data && data.event_data.event_type === 'referral_join') {
                update_from_user_twyst_bucks(data.from_user);
            }
            var bucks = data.user.twyst_bucks;
            var event_type = data.event_data.event_type;

            var code, header, line1, line2, outlet_id, outlet_name, checkin_left;
            if (data.user.coupons.length) {
                code = data.user.coupons[data.user.coupons.length - 1].code;
            }

            if (event_type === 'checkin' && !data.checkins_to_go && data.user.coupons.length) {
                header = data.user.coupons[data.user.coupons.length - 1].header;
                line1 = data.user.coupons[data.user.coupons.length - 1].line1;
                line2 = data.user.coupons[data.user.coupons.length - 1].line2;
                outlet_id = data.user.coupons[data.user.coupons.length - 1].issued_by;
                outlet_name = data.outlet.basics.name;
            } else if (event_type === 'checkin' && data.checkins_to_go) {
                outlet_id = data.outlet._id;
                outlet_name = data.outlet.basics.name;
                checkin_left = data.checkins_to_go;
            }

            var data = {};
            data.twyst_bucks = bucks;
            if (event_type === 'generate_coupon' || event_type == 'checkin') {

                data.code = code;
                data.header = header;
                data.line1 = line1;
                data.outlet_id = outlet_id;
                data.outlet_name = outlet_name;
                data.checkins_to_go = checkin_left;
            }

            HttpHelper.success(res, data, "Processed the event successfully.");
        })
        .fail(function(err) {
            console.log(err)
            HttpHelper.error(res, err || false, "Error processing the event");
        });
}

function basic_checks(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;

    if (!_.get(passed_data, 'user_token')) {
        deferred.reject("Authentication error - no token passed.");
    }

    if (!_.get(passed_data, 'event_data.event_type')) {
        deferred.reject('No event type - please pass event_type');
    }

    deferred.resolve(passed_data);

    return deferred.promise;
}

function get_user(data) {
    var AuthHelper = require('../common/auth.hlpr.js');
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
    var OutletHelper = require('./helpers/outlet.hlpr.js');
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

function process_event(data) {
    logger.log();

    var processors = {
        'follow': require('./processors/follow.proc'),
        'qr_checkin': require('./processors/qr_checkin.proc'),
        'panel_checkin': require('./processors/panel_checkin.proc'),
        'bulk_checkin': require('./processors/bulk_checkin.proc'),
        'mrl_checkin': require('./processors/mrl_checkin.proc'),
        'gift': require('./processors/gift.proc'),
        'grab': require('./processors/grab.proc'),
        'redeem': require('./processors/redeem.proc'),
        'unfollow': require('./processors/unfollow.proc'),
        'feedback': require('./processors/feedback.proc'),
        'submit_offer': require('./processors/submit_offer.proc'),
        'like_offer': require('./processors/like_offer.proc'),
        'unlike_offer': require('./processors/unlike_offer.proc'),
        'upload_bill': require('./processors/upload_bill.proc'),
        'share_offer': require('./processors/share_offer.proc'),
        'share_outlet': require('./processors/share_outlet.proc'),
        'suggestion': require('./processors/suggestion.proc'),
        'extend_offer': require('./processors/extend_offer.proc'),
        'report_problem': require('./processors/report_problem.proc'),
        'menu_update': require('./processors/menu_update.proc'),
        'write_to_twyst': require('./processors/comments.proc'),
        'generate_coupon': require('./processors/generate_coupon.proc'),
        'deal_log': require('./processors/deal_log.proc'),
        'referral_join': require('./processors/referral_join.proc')

    };

    var deferred = Q.defer();
    var passed_data = data;
    var event_type = passed_data.event_data.event_type;
    var processor = processors[event_type] || null;

    if (!processor) {
        deferred.reject('I don\'t know this type of event - ' + event_type);
    }

    processor.check(passed_data)
        .then(function(data) {
            return processor.process(passed_data);
        })
        .then(function(data) {
            deferred.resolve(passed_data);
        })
        .fail(function(err) {
            console.log(err)
            deferred.reject('Could not process the event - ' + err);
        });

    return deferred.promise;
}

function update_outlet_event_analytics(data) {
    logger.log()
    var deferred = Q.defer();
    var event_type = data.event_data.event_type;
    var update = {
        $inc: {}
    };
    var key = 'analytics.event_analytics.' + event_type;
    update.$inc[key] = 1;
    if (data.outlet) {
        Outlet.findOneAndUpdate({
            _id: data.outlet._id
        }, update, function(err, outlet) {
            if (err) {
                deferred.reject('Could not update outlet analytics' + err);
            } else {
                deferred.resolve(data);
            }
        });
    }

    deferred.resolve(data);
    return deferred.promise;
}

function update_user_event_analytics(data) {
    logger.log()
    var deferred = Q.defer();
    var event_type = data.event_data.event_type;
    var update_total = {
        $inc: {},
        $set: {
            'last_event.when': new Date()
        }
    };

    var update_total_by_outlet = {
        $inc: {

        }
    }

    var key_total = 'user_meta.total_events.' + event_type;
    update_total.$inc[key_total] = 1;

    if (data.outlet) {
        var key_outlet = 'user_meta.total_events_by_outlet.' + data.outlet._id + '.' + event_type;
        update_total_by_outlet.$inc[key_outlet] = 1;

        User.findOneAndUpdate({
            _id: data.user._id
        }, update_total, function(err, user) {
            if (err) {
                deferred.reject('Could not update user analytics' + err);
            } else {
                User.findOneAndUpdate({
                    _id: data.user._id
                }, update_total_by_outlet, function(err, user) {
                    if (err) {
                        deferred.reject('Could not update user analytics' + err);
                    } else {
                        deferred.resolve(data);
                    }
                });
            }
        });
    }

    deferred.resolve(data);
    return deferred.promise;
}

function create_event(data) {
    logger.log();

    var deferred = Q.defer();
    var event = {};
    var passed_data = data;

    event = _.extend(event, passed_data.event_data);
    event.event_user = passed_data.user._id;

    if (passed_data.outlet) {
        event.event_outlet = passed_data.outlet._id;
    }

    event.event_date = event.event_date || new Date();
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

function update_twyst_bucks(data) {
    logger.log();
    var deferred = Q.defer();

    if (data.already_followed || data.already_liked) {
        deferred.resolve(data);
    } else {
        var event_type = data.event_data.event_type;
        var available_twyst_bucks = data.user.twyst_bucks;
        var update_twyst_bucks = {
            $set: {

            }
        }

        Cache.hget('twyst_bucks', "twyst_bucks_grid", function(err, reply) {
            if (err || !reply) {
                deferred.reject('Could not get bucks grid' + err);
            } else {

                var bucks_grid = JSON.parse(reply);

                _.find(bucks_grid, function(current_event) {
                    if (current_event.event === event_type && current_event.update_now) {
                        if (current_event.earn) {
                            data.user.twyst_bucks = available_twyst_bucks + current_event.bucks;
                        } else {
                            data.user.twyst_bucks = available_twyst_bucks - current_event.bucks;
                        }

                        update_twyst_bucks.$set.twyst_bucks = data.user.twyst_bucks;

                        User.findOneAndUpdate({
                            _id: data.user._id
                        }, update_twyst_bucks, function(err, user) {
                            if (err) {
                                deferred.reject('Could not update user bucks' + err);
                            } else {
                                deferred.resolve(data);
                            }
                        });
                    }
                })
                deferred.resolve(data);
            }
        });
    }

    return deferred.promise;
}


function update_from_user_twyst_bucks(user) {
    logger.log();
    var deferred = Q.defer();
    var available_twyst_bucks = user.twyst_bucks;
    user.twyst_bucks = available_twyst_bucks + 250;
    var update_twyst_bucks = {
        $set: {

        }
    }
    update_twyst_bucks.$set.twyst_bucks = user.twyst_bucks;
    User.findOneAndUpdate({
        _id: user._id
    }, update_twyst_bucks, function(err, user) {
        if (err) {
            deferred.reject('Could not update form user bucks' + err);
        } else {
            deferred.resolve(user);
        }
    });
    return deferred.promise;
}
