var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var mongoose = require('mongoose');


module.exports.check = function(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var menu_id = _.get(passed_data, 'event_data.event_meta.menu_id');
    var comment = _.get(passed_data, 'event_data.event_meta.comment');

    if (!menu_id) {
        deferred.reject('Menu info missing');
    } else if (!comment) {
        deferred.reject('Message is missing');
    } else {
        deferred.resolve(passed_data);
    }
    return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    deferred.resolve(passed_data);
    return deferred.promise;
};
