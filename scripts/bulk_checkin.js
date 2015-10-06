var rest = require('restler');
var csv = require('csv');
var fs = require("fs");
var async = require('async');

var config = {
	'csv_file_name': __dirname + '/a.csv', // File path which has phone numbers
	'checkin_url': 'http://localhost:3000/api/v4/checkin/bulk', // Checkin API
	'event_type': 'bulk_checkin',
	'event_outlet': '55f05cae6570f51b2a1d95e0',
	'token': '8OqHcyk7NWRFEwA7LjFhQR0YknBu0PpO',// Outlet ID
	'checkin_location': 'HOME_DELIVERY' // Checkin location DINE_IN / HOME_DELIVERY
}; 

initCheckin();
function initCheckin() {
	getPhoneNumbersFromFile(config.csv_file_name, function (phone_numbers) {
		async.each(phone_numbers, function (phone, callback) {
			httpCheckin(phone, function (data, response) {
				console.log(data);
				//console.log(response);
				callback();
			});
		}, function (err) {
			console.log(err);
			console.log('---------------------------------------');
			console.log(err || 'Completed Batch checkin process');
		});
	});
};

function httpCheckin (phone, cb) {
	var event_data = {};
	event_data.event_meta= {};
	event_data.event_meta.phone = phone;
	event_data.event_meta.event_type = config.event_type;
	event_data.event_outlet = config.event_outlet;
	event_data.event_meta.date = new Date();
	event_data.event_meta.outlet = config.event_outlet;
	event_data.event_meta.token = config.token;
	rest.post(config.checkin_url+'?token='+config.token, {
		data: event_data
	}).on('complete', function(data, response) {
		cb(data, response);
	});
};

function getPhoneNumbersFromFile(file_name, cb) {
	var phone_numbers = [];
	csv()
	.from
	.stream(fs.createReadStream(file_name, { encoding: 'utf8' }))
	.on('record', function (row, index) {
			phone_numbers.push(row[0]);
	})
	.on('end', function (count) {
		cb(phone_numbers);
	})
};
