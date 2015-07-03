'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
require('../models/event.mdl.js');
var Event = mongoose.model('Event');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var UserHelper = require('./helpers/user.hlpr.js');
var _ = require('underscore');

var Q = require('q');

module.exports.new = function(req, res) {
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

var create_event = function(res, token, created_event) {
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
