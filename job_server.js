'use strict';
/*jslint node: true */

var Agenda = require('agenda');
var _ = require('lodash');
var logger = require('tracer').colorConsole();

var jobs = [
	// {name: 'test', schedule: 'in 1 minute'}
	{name: 'unredeemed', schedule: 'in 2 minutes'}
];

(function() {
	logger.info('Starting the job server');
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});

	var job = null;
	_.each(jobs, function(item) {
		job = require('./jobs/' + item.name + '.job');
		job.runner(agenda);
		agenda.schedule(item.schedule, item.name);
	})

	agenda.start();
})();