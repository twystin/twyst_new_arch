var logger = require('tracer').colorConsole();

var _ = require('lodash');
var Q = require('q');
var CheckinHelper = require('../helpers/checkin.hlpr');

module.exports.check = function(data) {
    logger.log();
    var deferred = Q.defer();
    CheckinHelper.validate_request(data)
        .then(function(data) {
            return CheckinHelper.already_checked_in(data);
        })
        .then(function(data) {
            deferred.resolve(data);
        })
        .fail(function(err) {
            deferred.reject(err);
        })
    return deferred.promise;
}

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    CheckinHelper.check_and_create_coupon(data)
        .then(function(data) {
            return CheckinHelper.update_checkin_counts(data);
        })
        .then(function(data) {
            return CheckinHelper.send_sms(data);
        })
        .then(function(data) {
            data.event_data.event_type = 'checkin';
            deferred.resolve(data);
        })
        .fail(function(err) {
            deferred.reject(err);
        })
    return deferred.promise;
}
