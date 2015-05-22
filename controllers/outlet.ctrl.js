'use strict';
/*jslint node: true */

var AuthHelper = require('../common/auth.hlpr.js');

module.exports.new = function(req,res) {

  // CHECK THAT THE ROLE IS OK
  // SAVE THE Outlet
  console.log(req.query);
  AuthHelper.validate_token(req.query.token).then(function(success) {
    console.log(success);
  }, function(error) {
    console.log("ERROR");
  });
  res.status(200).send({'info':'ok'});
};
