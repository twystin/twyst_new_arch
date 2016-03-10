'use strict';
/*jslint node: true */
var crypto = require("crypto");
var Q = require('q');
var _ = require('underscore');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr.js');
var recharge_url = 'https://appapi.mobikwik.com/';
var request = require('request');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var uid = 'rc@twyst.in';
var pass= 'twy5t!@Adm1n[]';
var keygen = require('keygenerator');
var parseString = require('xml2js').parseString;


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
            request.get(recharge_url+"getBalance.do?"+"uid="+uid+"&pwd="+pass, function(err, res, body){
                if(err || res.statusCode != 200){
                    deferred.reject({
                      err: err || true,
                      message: "Could not process your request right now"
                    });    
                }
                else{
                    console.log(body);
                    var response;
                    parseString(body, function (err, result) {
                        response = result;

                    });
                    console.log(response);
                    console.log(user.twyst_cash);

                    var twyst_balance = response.balancecheck.balance[0];
                    var required_twyst_cash = recharge_req.amount+parseInt(recharge_req.amount*10/100)
                    console.log(required_twyst_cash);
                    if(twyst_balance < 1000) {
                        //send email to twyst
                        console.log('send email to twyst');
                    }

                    if(twyst_balance < recharge_req.amount) {
                        deferred.reject({
                          err: err || true,
                          message: "Could not process your request right now"
                        });   
                    }
                    else if(user.twyst_cash >= required_twyst_cash) {
                        var cn = recharge_req.phone;
                        var amt = recharge_req.amount;
                        var op = recharge_req.operator;
                        var cir  = recharge_req.circle;
                        var reqid  = keygen._({chars: false, specials: false, length: 20});
                        console.log(cn)
                        console.log(amt)
                        console.log(op)
                        console.log(cir)
                        console.log(reqid)
                        request.get(recharge_url+"recharge.do?"+"uid="+uid+"&pwd="+pass+"&cn="+cn+"&amt="+amt+"&op="+op+"&cir="+cir+"&reqid="+reqid, function(err, res, body) {
                            if(err || res.statusCode != 200){
                                console.log(err);
                                deferred.reject({
                                  err: err || true,
                                  message: "Could not process your request right now"
                                });    
                            }
                            else{
                                console.log(body);
                                var availabe_twyst_cash = user.twyst_cash - required_twyst_cash;
                                User.findOneAndUpdate({
                                    _id: user._id
                                }, {$set: {twyst_cash: availabe_twyst_cash}}).exec(function(err, user){
                                    if(err) {
                                        console.log(err);
                                        deferred.reject(err);
                                    }
                                    else{
                                        
                                        deferred.resolve({
                                            data: user,
                                            message: 'Recharge Successfull'
                                        });       
                                    }
                                })
                                 
                            }
                            
                        })             
                    }
                    else{
                        deferred.reject({
                          err: err || true,
                          message: "Not enough twyst cash"
                        }); 
                    }   
                }
                
            })       
        }
     }, function(err) {
        deferred.reject({
          err: err || true,
          message: "Couldn\'t find user"
        });
     });

	return deferred.promise;
};
