'use strict';
/*jslint node: true */
var logger = require('tracer').colorConsole();
var HttpHelper = require('../common/http.hlpr');
var _ = require('lodash');
var Transporter = require('../transports/transporter.js');

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