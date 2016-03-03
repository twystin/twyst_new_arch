'use strict';
/*jslint node: true */

var Agenda = require('agenda');
var _ = require('lodash');
var logger = require('tracer').colorConsole();
var mongoose = require('mongoose');
var jobs = [
	// {name: 'test', schedule: 'in 1 minute'}
	//{name: 'unredeemed', schedule: 'in 1 minute'},
	//{name: 'reactivate', schedule: 'in 1 minute'},
	//{name: 'social_pool', schedule: 'in 1 seconds'}
	{name: 'order_pending', schedule: 'in 1 seconds', every: '20 seconds'}
];

(function() {
	logger.info('Starting the job server');
	mongoose.connect('mongodb://localhost/retwyst');
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});

	var job = null;
	_.each(jobs, function(item) {
		job = require('./jobs/' + item.name + '.job');
		agenda.on('ready', function() {
	    	job.runner(agenda);  
			agenda.every(item.every, item.name);  
	    });
		
	})

	agenda.start();
})();