'use strict';
/*jslint node: true */


var _ = require('lodash');
var mongoose = require('mongoose');
var Q = require('q');
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr.js');
var AuthHelper = require('../common/auth.hlpr.js');
var Outlet = mongoose.model('Outlet');
var Cache = require('../common/cache.hlpr.js');

module.exports.search = function(req, res) {
    var token = req.query.token || null;
    if (!token) {
        HttpHelper.error(res, null, "Not authenticated");
    }

    Outlet.setKeywords(function(err) {
        if(err) {
            HttpHelper.error(res, null, "erro in saving keywords");
        }
    });

    AuthHelper.get_user(req.query.token).then(function(user) {
        logger.log();
        var deferred = Q.defer();

        Outlet.search(req.query.text,  {
            }, function(err, data) {
                if(err){
                    HttpHelper.error(res, null, "No result");
                }
               else{
                    console.log(data)
                    Cache.get('outlets', function(err, reply) {
                        if (err) {
                          deferred.reject('Could not get outlets');
                        } else {
                            var outlets = {};
                            outlets.outlets = [JSON.parse(reply)];
                            HttpHelper.success(res, outlets, 'Found result');
                          
                        }
                    });
                    
                }
        });
       
    },function(err) {
    HttpHelper.error(res, err, 'Couldn\'t find the user');
  });
    
  
};



