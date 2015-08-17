'use strict';
/*jslint node: true */

var Agenda = require('agenda');
var _ = require('lodash');
var logger = require('tracer').colorConsole();

var jobs = [
	{name: 'test', every: '1 minute'}
];

module.exports.start = function() {
	var agenda = new Agenda({db: { address: 'localhost:27017/twyst_agend'}});
	var job = null;
	_.each(jobs, function(item) {
		job = require('../jobs/' + item.name + '.job');
		job.runner(agenda);
		agenda.every(item.every, item.name);
	})

	agenda.start();
}