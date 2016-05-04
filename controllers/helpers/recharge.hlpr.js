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
var Event = mongoose.model('Event');
var uid = 'admin@twyst.in';
var pass= 'twy5t.1n';
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
                    var handling_fee = Math.round(recharge_req.amount*10/100);
                    if(handling_fee < 10) {
                        handling_fee = 10;
                    }
                    var required_twyst_cash = recharge_req.amount+parseInt(handling_fee);
                    console.log(required_twyst_cash);
                    if(twyst_balance < 1000) {
                        //send email to twyst
                        console.log('send email to twyst');
                    }
                    
                    if(user.twyst_cash >= required_twyst_cash) {
                        if(twyst_balance < recharge_req.amount) {
                            deferred.reject({
                              err: err || true,
                              message: "Could not process your request right now"
                            });   
                        }
                        else{
                            var cn = recharge_req.phone;
                            var amt = recharge_req.amount;
                            var op = recharge_req.operator;
                            var cir  = recharge_req.circle;
                            var reqid  = keygen._({chars: false, specials: false, length: 20});
                            var conntype;
                            if(recharge_req.conntype === 'postpaid') {
                                conntype = 'postpaid';
                            }
                            else{
                                conntype = 'prepaid';   
                            }
                        
                            request.get(recharge_url+"recharge.do?"+"uid="+uid+"&pwd="+pass+"&cn="+cn+"&amt="+amt+"&op="+op+"&cir="+cir+"&reqid="+reqid+"&conntype="+conntype, function(err, res, body) {
                                var recharge_res;
                                parseString(body, function (err, mobikwik_response) {
                                    recharge_res = mobikwik_response;

                                });
                                console.log(body);
                                console.log(recharge_res);
                                if(recharge_res.recharge.status[0] === 'SUCCESS' ||
                                    recharge_res.recharge.status[0] === 'SUCCESSPENDING') {
                                    
                                    var availabe_twyst_cash = user.twyst_cash - required_twyst_cash;
                                    User.findOneAndUpdate({
                                        _id: user._id
                                    }, {$set: {twyst_cash: availabe_twyst_cash}}).exec(function(err, user){
                                        if(err) {
                                            console.log(err);
                                            deferred.reject(err);
                                        }
                                        else{
                                            var event = {};            
                                            event.event_meta = {};
                                            event.event_meta.phone = cn;
                                            event.event_meta.twyst_cash = required_twyst_cash;
                                            event.event_meta.amount = amt;
                                            event.event_meta.op = op;
                                            event.event_meta.circle = cir;
                                            event.event_meta.conntype = conntype;
                                            event.event_meta.txId = recharge_res.recharge.txId[0];
                                            event.event_user = user._id;
                                            event.event_type = 'recharge_phone';                                                                
                                            event.event_date = new Date();
                                            var created_event = new Event(event);
                                            created_event.save(function(err, e) {
                                                if (err || !e) {
                                                    deferred.reject('Could not save the event - ' + JSON.stringify(err));
                                                } else {
                                                    deferred.resolve({
                                                        data: availabe_twyst_cash,
                                                        message: 'Recharge Successfull'
                                                    });  
                                                }
                                            });                                            
                                        }
                                    })
                                }                    
                                else if(recharge_res.recharge.status[0] === 'FAILURE'){
                                    deferred.reject({
                                      err: err || true,
                                      message: recharge_res.recharge.errorMsg[0]
                                    }); 
                                }
                                else{
                                    deferred.reject({
                                      err: err || true,
                                      message: "Could not process your request right now"
                                    });    
                                }
                                
                            })
                        }                                    
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
