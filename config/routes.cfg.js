'use strict';
/*jslint node: true */

var mustBe = require('mustbe').routeHelpers();

var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  (function AccountRoutes() {
    var AccountCtrl = require('../controllers/account.ctrl');
    app.post('/api/v4/accounts/login', function(req, res, next) {
        next();
      }, passport.authenticate('account'),
      AccountCtrl.login);
  })();

  (function OutletRoutes() {
    var OutletCtrl = require('../controllers/outlet.ctrl');
    app.post('/api/v4/outlets', mustBe.authorized('outlet.create', OutletCtrl.new));
  })();

};
