'use strict';
/*jslint node: true */

var http = require('http');
var sms_push_url = "http://myvaluefirst.com/smpp/sendsms?username=twysthttp&password=twystht6&to=";

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

// payload format: {phone, from, message}
module.exports.send = function(payload) {
  logger.log();
  var deferred = Q.defer();

  var send_sms_url = sms_push_url +
    payload.phone +
    "&from=" +
    payload.from +
    "&udh=0&text=" +
    payload.message;

  http.get(send_sms_url, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      deferred.resolve(body);
    });

    res.on('error', function(e) {
      deferred.reject(e);
    });
  });

  return deferred.promise;
}
