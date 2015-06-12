'use strict';
/*jslint node: true */

var moment = require('moment');

var oneminute = module.exports.oneminute = 60 * 1000;
var fiveminutes = module.exports.fiveminutes = 5 * oneminute;
var oneday = module.exports.oneday = 24 * 60 * oneminute;

module.exports.timediff = function(time) {
  console.log("NOW:" + new Date(Date.now()));
  console.log("CREATED:" + new Date(time));
  console.log("DIFF:" + Date.now() - new Date(time));
  return (Date.now() - new Date(time)) || null;
};
