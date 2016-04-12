var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var CheckinHelper = require('../helpers/checkin.hlpr.js');
var NotifHelper = require('../helpers/notif.hlpr.js');
var Transporter = require('../../transports/transporter.js');

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
        //.then(function(data) {
            //return NotifHelper.send_notification(data, data.checkin_message, 'Checkin Successful');
        //})
        .then(function(data) {
            return send_sms(data);
        })
        .then(function() {
            data.event_data.event_type = 'checkin';
            data.event_data.event_meta.event_type = 'panel_checkin';
            deferred.resolve(data);
        })
        .fail(function(err) {
            deferred.reject(err);
        })
    return deferred.promise;
}

function send_sms(data) {
    logger.log();
    var deferred = Q.defer();

    var payload  = {}
    payload.from = 'TWYSTR';
    payload.message = data.checkin_message;
    payload.phone = data.user.phone;
    console.log(payload);
    Transporter.send('sms', 'vf', payload);
    deferred.resolve(data);
    return deferred.promise;
}

