'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Location = new Schema({
    
    city : {type: String, default: '', trim: true},
    location: [{
    	longitude: { type: Number },
	    latitude: { type: Number },        
	    location_1: {type: String, default: '', trim: true},
	    location_2: {type: String, default: '', trim: true},       	
    }]
  
});

module.exports = mongoose.model('Location', Location);
