'use strict';
/*jslint node: true */

var Agenda = require('agenda');
// UNCOMMENT THESE TO GET WEB MANAGEMENT OF JOBS
// var agenda_web = require('agenda-ui');

var _ = require('lodash');
var logger = require('tracer').colorConsole();

var jobs = [
	{name: 'test', schedule: 'in 1 minute'}
];

module.exports.start = function(app) {
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agenda'}});
	// app.use('/jobs', agenda_web(agenda, {poll: 1000}));

	var job = null;
	_.each(jobs, function(item) {
		job = require('../jobs/' + item.name + '.job');
		job.runner(agenda);
		agenda.schedule(item.schedule, item.name);
	})

	agenda.start();
}