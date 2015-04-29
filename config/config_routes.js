'use strict';
var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  var MerchantCtrl = require('../controllers/merchant');
  app.post('/api/v1/auth/merchant', function (req, res, next) {
      next();
  }, passport.authenticate('merchant'), MerchantCtrl.login);

  var CustomerCtrl =
  require('../controllers/account');
  app.post('/api/v1/auth/account', function(req,res,next) {
    next();
  }, passport.authenticate('account'),
  CustomerCtrl.login);

};
