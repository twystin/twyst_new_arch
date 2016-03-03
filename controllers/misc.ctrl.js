'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var _ = require('lodash');
var Transporter = require('../transports/transporter.js');
var AuthHelper = require('../common/auth.hlpr');


module.exports.send_link = function(req, res) {
	logger.log();
	if (!req.body.mobile && !req.body.email) {
		HttpHelper.error(res, null, "Invalid request for app link");
	} else if (req.body.mobile) {
		Transporter.send('sms', 'vf', {
			from: 'TWYSTR',
		    message: "Get Twyst now at http://twy.st/app",
		    phone: req.body.mobile
		}).then(function(info) {
			console.log(info);
			HttpHelper.success(res, null, "A link to the app has been sent");
		}, function(err) {
			console.log(err);
			HttpHelper.error(res, null, "Something went wrong. Please try again after some time");
		});
	} else {
		Transporter.send('email', 'gmail', {
			from: 'contactus@twyst.in',
			to: req.body.email,
			subject: 'Get the Twyst App Now!',
			text: 'Get the Twyst App @ http://twy.st/app',
			html: 'Download the app now <a href="http://twy.st/app" target="_blank"><strong>here<strong></a>'
		}).then(function(info) {
			console.log(info);
			HttpHelper.success(res, null, "A link to the app has been sent");
		}, function(err) {
			console.log(err);
			HttpHelper.error(res, null, "Something went wrong. Please try again after some time");
		});
	}
}

module.exports.send_verification_email = function(req, res){
	logger.log();
	AuthHelper.get_user(req.query.token).then(function(data) {
    	var user = data.data;
    	console.log()
      	if(user.validation && user.validation.email) {
      		HttpHelper.success(res, null, "User already has a verified email id");	
      	}
      	else if(user.validation && user.validation.sent_email_count >= 3){
      		HttpHelper.success(res, null, "User has crossed maximum number of atteptes");	
      	}
      	else{
      		var merchant_payload = {
		        Destination: { 
		            BccAddresses: [],
		            CcAddresses: [],
		            ToAddresses: [ 'kuldeep@twyst.in'] //, merchant_email
		        },
		        Message: { /* required */
		            Body: { /* required */
		                Html: {
		                    Data: "<h4>Click here</h4>" 
		                },
		                Text: {
		                    Data: 'Click here'
		                    
		                }
		            },
		            Subject: { /* required */
		              Data: 'Verify your Twyst email acount', /* required */
		              
		            }
		        },
		        Source: 'info@twyst.in',
		        ReturnPath: 'info@twyst.in' 
		    };
      		Transporter.send('email', 'ses', merchant_payload).then(function(info) {
				console.log(info);
				//update user
				HttpHelper.success(res, null, "An email verification link has been sent to your email id");
			}, function(err) {
				console.log(err);
				HttpHelper.error(res, null, "Something went wrong. Please try again after some time");
			});
      	}
    }, function(err) {
      	HttpHelper.error(res, null, "Could not find user");
    });
	
}