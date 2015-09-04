'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var Cache = require('../common/cache.hlpr');
var AuthHelper = require('../common/auth.hlpr');
var HttpHelper = require('../common/http.hlpr');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Outlet = mongoose.model('Outlet');
var Event = mongoose.model('Event');

module.exports.get_notif = function(req, res) {
    logger.log();
    var deferred = Q.defer();

    get_user(req.query.token)
    .then(function(data) {
      return get_user_events(data);
    })
    .then(function(data) {

      HttpHelper.success(res, data, "Got notifications.");
    })
    .fail(function(err) {
      console.log(err)
      HttpHelper.error(res, err || false, "Error in geting notifications");
    });

};

function get_user(token) {
    logger.log();

    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        deferred.resolve(data);
    }, function(err) {
        deferred.reject("Could not find the user for token - " + token);
    });

    return deferred.promise;
}

function get_user_events(passed_data){
    logger.log();
    var deferred = Q.defer(); 
    Event.find({event_user: passed_data.data._id}, {}, function(err, events){
        if(err){
            deferred.reject(err);
        }
        else{
            deferred.resolve(events)
            
        }
    })  
    return deferred.promise;
}



