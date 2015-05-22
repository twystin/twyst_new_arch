'use strict';
var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  var AccountCtrl = require('../controllers/account');
  app.post('/api/v1/auth/account', function(req,res,next) {
    next();
  }, passport.authenticate('account'),
  AccountCtrl.login);

};
