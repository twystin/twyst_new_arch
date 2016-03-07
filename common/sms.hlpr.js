'use strict';
/*jslint node: true */

// require('../models/sms_log.mdl.js');
var mongoose = require('mongoose');
var Q = require('q');
var http = require('http');
var sms_push_url = "http://myvaluefirst.com/smpp/sendsms?username=twysthttp&password=twystht6&to=";
// var SMSLog = mongoose.model('SMSLog');


/* Need to bring in a lot of logic here:
- Off times
- Scheduling
- Blacklisted
*/

module.exports.send_sms = function(phone, message, type, from, outlet) {
	var sms_message = message.replace(/(\n)+/g, '').replace(/&/g,'%26');
	sms_message = sms_message.replace(/% /g,'%25 ');

  var sms_from = from || 'TWYSTR';
  var send_sms_url = sms_push_url +
                      phone +
                      "&from=" +
                      sms_from +
                      "&udh=0&text=" +
                      sms_message;

  var deferred = Q.defer();
    http.get(send_sms_url, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            // append chunk to your data
            body += chunk;
        });

        res.on('end', function () {
          console.log(body);
						createSMSRecord(phone, message, sms_push_url);
            deferred.resolve({data: body, message: 'Sent SMS'});
        });

        res.on('error', function (e) {
            deferred.reject({err: e, message: 'Couldn\'t send SMS'});
        });
    });

  return deferred.promise;
};
