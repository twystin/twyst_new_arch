'use strict';
/*jslint node: true */
var crypto = require("crypto");
var Q = require('q');
var logger = require('tracer').colorConsole();
var recharge_url = 'https://www.mobikwik.com';
var request = require('request');
var mid = 'MBK2136';
var pass= 'twy5tpg@890';


module.exports.process_recharge_req = function(token, recharge_req) {
	logger.log();
	var deferred = Q.defer();
	
	AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        if(user.isBlacklisted) {
            deferred.reject({
                err: err || true,
                message: 'you can not do this transaction'
            });
        }
        else{
            if(user.twyst_cash > recharge_req.amount) {
            	var cn = recharge_req.phone;
            	var amt = recharge_req.amount;
            	var op = 1;
            	var cir  = 5;
            	var reqid = '';
            }
            else{
            	deferred.reject({
		          err: err || true,
		          message: "Not enough twyst cash"
		        });	
            }
        }
     }, function(err) {
        deferred.reject({
          err: err || true,
          message: "Couldn\'t find user"
        });
     });

	return deferred.promise;
};
