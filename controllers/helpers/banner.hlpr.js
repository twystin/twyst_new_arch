'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var moment = require('moment');
var Banner = mongoose.model('Banner');
var User = mongoose.model('User');

module.exports.create_banner = function(token, new_banner) {
    logger.log();
    var deferred = Q.defer();

    var banner = {};
    banner = _.extend(banner, new_banner);

    AuthHelper.get_user(token).then(function(data) {
        banner = new Banner(banner);

        banner.save(function(err, banner) {
            if (err) {
                console.log(err);
                deferred.reject({
                    err: err || false,
                    message: 'Couldn\'t create banner'
                });
            } else {
                deferred.resolve({
                    data: banner,
                    message: 'Banner created successfully'
                });
            }
        });
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });

    return deferred.promise;
}

module.exports.get_banner = function(token, bannerId) {
    logger.log();
    var deferred = Q.defer();

    Banner.findById(bannerId)
        .exec(function(err, banners) {
            if (err || !banners) {
                deferred.reject({
                    err: err,
                    message: 'Unable to load banner details'
                })
            } else {
               
                deferred.resolve({
                    data: banners,
                    message: 'banner found'
                });
            }
        })
    return deferred.promise;
}


module.exports.update_banner = function(token, updated_banner) {
    logger.log();
    var deferred = Q.defer();

    Banner.findById(updated_banner._id)
        .exec(function(err, banner) {
            if (err || !banner) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to update banner'
                });
            } else {
                console.log(updated_banner)
                banner = _.extend(banner, updated_banner);
                banner.save(function(err) {
                    if (err) {
                        console.log(err)
                        deferred.reject({
                            err: err || true,
                            message: 'Failed to update banner'
                        });
                    } else {
                        deferred.resolve({
                            data: banner,
                            message: "Banner updated successfully"
                        });
                    }
                });
            }
        });
    return deferred.promise;
}

module.exports.delete_banner = function(token, bannerId) {
    logger.log();
    var deferred = Q.defer();

    Banner.findOneAndRemove({
            _id: bannerId
        })
        .exec(function(err) {
            if (err) {
                deferred.reject({
                    data: err || true,
                    message: 'Unable to delete the banner right now'
                });
            } else {
                deferred.resolve({
                    data: {},
                    message: 'Deleted banner successfully'
                });
            }
        });
    return deferred.promise;
}


module.exports.get_all_banners = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        
        Banner.find({}).exec(function(err, banners) {
            if (err || !banners) {
                deferred.reject({
                    err: err || true,
                    message: 'Failed to load banners'
                });
            } 
            else{
                
                deferred.resolve({
                    data: banners,
                    message: 'Banners loaded successfully'
                });   
            }
        });
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });
    return deferred.promise;
}
