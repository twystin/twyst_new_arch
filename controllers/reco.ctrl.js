'use strict';
/*jslint node: true */

var mongoose = require('mongoose');
var Outlet = mongoose.model('Outlet');
var HttpHelper = require('../common/http.hlpr.js');

module.exports.get = function(req, res) {
  // console.log(req.params);
  //console.log(req.query);

  var start, end = null;

  if (req.query &&
      req.query.start &&
      req.query.end) {
    start = req.query.start;
    end = req.query.end;
    if (start && end) {
      console.log("START " + start + " END " + end);
    }
  }

  Outlet.find({},
              {},
              {
                skip: start - 1,
                limit: end + 1 - start
              },
    function(err, outlets) {
    HttpHelper.success(res, err || false, outlets);
  });
};
