var transporter = require('./transporter');

var meta = {};
meta.body = "test";
meta.head = "twyst push";
meta.gcms = 'APA91bHPaFIAvkWTIEeNfcEwgmIw02Q_LVSIDMDeuBnoXOfHhJpx3xGx9P3IzkRTp0nQH5Qx6ZXfsvVXFMapFy-WNYBmpfjlSk4OwZ7ZQLRQweiojHgKZx0';

transporter.send('push', 'gcm', meta).then(function(data) {
	console.log(data);
}, function(err) {
	console.log(err);
})