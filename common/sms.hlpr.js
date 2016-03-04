'use strict';
/*jslint node: true */

// require('../models/sms_log.mdl.js');
var mongoose = require('mongoose');
var Q = require('q');
var http = require('http');
var sms_push_url = "http://myvaluefirst.com/smpp/sendsms?username=twysthttp&password=twystht6&to=";
var StoreSMSMessages = require('../models/store_sms_messages.mdl.js');

// var SMSLog = mongoose.model('SMSLog');


/* Need to bring in a lot of logic here:
- Off times
- Scheduling
- Blacklisted
*/
/*-----------------------------------------------------------------

-----------------------------------------------------------------*/
var createSMSRecord = function(receiver, message, sending_entity){
	var db = mongoose.createConnection('mongodb://localhost/retwyst_sms_logs');
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {

		var smsRecord = new StoreSMSMessages({
			receiver: receiver,
			message: message,
			sending_entity: sending_entity})
			.save(function(err){
				if(err) return console.error(err);
				console.log("Data was saved");
			});
	});
};

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
