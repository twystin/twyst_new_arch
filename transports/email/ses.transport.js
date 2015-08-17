'use strict';
/*jslint node: true */

var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');

var aws = require('aws-sdk');

module.exports.send = function(payload) {
  logger.log();
  var deferred = Q.defer();

  aws.config.update({
    "accessKeyId": "AKIAJTAQ7XF55TQMK5FA",
    "secretAccessKey": "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",
    "region": "us-west-2"
  });
  var ses = new aws.SES({
    apiVersion: '2010-12-01'
  });

  ses.sendEmail(payload, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.success(data);
    }
  });

  return deferred.promise;
}
