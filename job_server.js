'use strict';
/*jslint node: true */

var Agenda = require('agenda');
var _ = require('lodash');
var logger = require('tracer').colorConsole();
var mongoose = require('mongoose');
var order_pending_job = {name: 'order_pending', every: '1 minutes'};
var order_auto_reject_job = {name: 'order_auto_reject', every: '1 minutes'};
var assumed_delivered_job = {name: 'assumed_delivered', every: '1 minutes'};
var order_delivered_job = {name: 'order_delivered', every: '1 minutes'};

mongoose.connect('mongodb://localhost/retwyst');

	// {name: 'test', schedule: 'in 1 minute'}
	//{name: 'unredeemed', schedule: 'in 1 minute'},
	//{name: 'reactivate', schedule: 'in 1 minute'},
	//{name: 'social_pool', schedule: 'in 1 seconds'}

(function() {
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});

	var job = null;
	
	job = require('./jobs/' + order_delivered_job.name + '.job');
	agenda.on('ready', function() {
    	job.runner(agenda);  
		agenda.every(order_delivered_job.every, order_delivered_job.name);
    });

	agenda.start();
})();

(function() {
	logger.info('Starting the job server');
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});

	var job = null;
	
	job = require('./jobs/' + order_pending_job.name + '.job');
	agenda.on('ready', function() {
    	job.runner(agenda);  
		agenda.every(order_pending_job.every, order_pending_job.name);
    });
	agenda.start();
})();

(function() {
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});

	var job = null;
	
	job = require('./jobs/' + order_auto_reject_job.name + '.job');
	agenda.on('ready', function() {
    	job.runner(agenda);  
		agenda.every(order_auto_reject_job.every, order_auto_reject_job.name);
    });
		
	agenda.start();
})();

(function() {
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});

	var job = null;
	
	job = require('./jobs/' + assumed_delivered_job.name + '.job');
	agenda.on('ready', function() {
    	job.runner(agenda);  
		agenda.every(assumed_delivered_job.every, assumed_delivered_job.name);
    });
	
	agenda.start();
})();
