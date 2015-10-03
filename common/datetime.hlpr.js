'use strict';
/*jslint node: true */

var moment = require('moment');
var dateFormat = require('dateformat');

var oneminute = module.exports.oneminute = 60 * 1000;
var fiveminutes = module.exports.fiveminutes = 5 * oneminute;
var oneday = module.exports.oneday = 24 * 60 * oneminute;


module.exports.timediff = function(time) {
  return (Date.now() - new Date(time)) || null;
};


function formatTime(hours, minutes) {
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

module.exports.formatDate = function(date) {
    return dateFormat(date, "dd mmm yyyy");
};