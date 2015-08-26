var transporter = require('./transporter');

var meta = {};
meta.body = "test";
meta.head = "twyst push";
meta.gcms = '355490061720953';

transporter.send('push', 'gcm', meta).then(function(data) {
	console.log(data);
}, function(err) {
	console.log(err);
})