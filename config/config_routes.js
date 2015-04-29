'use strict';
var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  var MerchantCtrl = require('../controllers/merchant');
  app.post('/api/v1/auth/merchant', function (req, res, next) {
      next();
  }, passport.authenticate('merchant'), MerchantCtrl.login);

  var CustomerCtrl =
  require('../controllers/customer');
  app.post('/api/v1/auth/customer', function(req,res,next) {
    next();
  }, passport.authenticate('customer'),
  CustomerCtrl.login);

};
