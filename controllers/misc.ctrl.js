'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var _ = require('lodash');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transporter = require('../transports/transporter.js');
var AuthHelper = require('../common/auth.hlpr');
var GetTemplatePath = require('../common/getTemplatePath.cfg.js');
var MailContent       = require('../common/template.hlpr.js');
var PayloadDescriptor = require('../common/email.hlpr.js');
var Keygenerator      = require('keygenerator');
var sender = "info@twyst.in";

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
      	if(user.validation && user.validation.email) {
      		HttpHelper.success(res, null, "User already has a verified email id");	
      	}
      	else if(user.validation && user.validation.sent_email_count >= 3){
      		HttpHelper.success(res, null, "User has crossed maximum number of atteptes");	
      	}
      	else{
      		var token  = Keygenerator.session_id();
      		var filler = {
				"name":user.first_name,
				"link":'http://twyst.in/verify/email/' + token
			};

			MailContent.templateToStr(GetTemplatePath.byName('email_verification_mail.hbs'), filler, function(mailStr){
				var payloadDescriptor = new PayloadDescriptor('utf-8', user.email, 'Verify your account!',mailStr, sender);
				Transporter.send('email', 'ses', payloadDescriptor).then(function(info) {					
					User.findOneAndUpdate({
						_id: user._id
					}, 
					{$set: {'validation.verification_mail_token': token}}).exec(function(err, user){
						if(err) {
							HttpHelper.error(res, null, "Error in sending verification token");		
						}
						else{
							HttpHelper.success(res, null, "An email verification link has been sent to your email id");		
						}
					})
					
				}, function(err) {
					console.log(err);
					HttpHelper.error(res, null, "Error in sending verification token");
				});
			});
      		
      		
      	}
    }, function(err) {
      	HttpHelper.error(res, null, "Could not find user");
    });	
}

module.exports.optout_user = function(req, res){
	logger.log();
	var phone = req.body.phone;
	var outlet_id = req.body.outlet_id;
	var block_all = req.body.block_all;
	console.log(req.body);
	User.findOne({
		phone: phone
	}, function (err, user) {
		if(err || !user) {
			console.log('Could not find user');
			// Do nothing
			HttpHelper.error(res, null, "Could not find user");	
		}
		else{
			if(block_all && !outlet_id){
				user.messaging_preferences.block_all.sms.promo = true;
			}
			else if(outlet_id && !block_all) {
				var obj = {};
				obj.outlet_id = outlet_id;
				obj.handle = 'TWYSTR';
				obj.sms = {};
				console.log(obj);
				obj.sms.promo = true;
				user.messaging_preferences.block_outlets.push(obj);
			}
			else{
				user.messaging_preferences.block_all.sms.promo = true;
				var obj = {};
				obj.outlet_id = outlet_id;
				obj.handle = 'TWYSTR';
				obj.sms = {};
				obj.sms.promo = true;
				console.log(obj);
				user.messaging_preferences.block_outlets.push(obj);
			}
			user.save(function(err, user){
				if(err){
					HttpHelper.error(res, null, "Could not submit your response");	
				}
				else{
					HttpHelper.success(res, null, "Your request has been submitted successfully");
				}
			})
		}
	})
}