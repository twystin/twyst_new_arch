'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var geolib = require('geolib');
var moment = require('moment');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var Order = mongoose.model('Order');
var logger = require('tracer').colorConsole();


module.exports.make_payment = function(data) {
    logger.log();
    var deferred = Q.defer();

    deferred.resolve(data);
    return deferred.promise;
}