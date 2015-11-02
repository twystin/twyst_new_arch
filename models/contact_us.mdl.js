var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactUsSchema = new Schema({
	name: String,
	email: String,
	comments: String
});

module.exports = mongoose.model('ContactUs', ContactUsSchema);