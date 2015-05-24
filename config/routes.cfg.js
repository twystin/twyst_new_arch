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
    app.put('/api/v4/outlets/:outlet_id', mustBe.authorized('outlet.update', OutletCtrl.update));
  })();

  (function UserRoutes() {
    var UserCtrl = require('../controllers/user.ctrl');
    app.get('/api/v4/users/:id', UserCtrl.get);
  })();
};


/*
ROUTES I NEED FOR THE WEB & PHONE APP

1. Authentication related:
POST /api/v4/accounts/login - Log the user in.
GET /api/v4/otp - Get an OTP code.
POST /api/v4/otp - Validated an OTP code & create an account.

2. Discover related:
GET /api/v4/outlets?token=123&lat=123&long=123&datetime=123 - Get outlets for me
GET /api/v4/outlets?q=latte,coffee - Search
GET /api/v4/users/me - Get my user account
GET /api/v4/users/123 - Get a user account info
POST /api/v4/events - Post an event
GET /api/v4/events?token=123&lat=123&long=123 - Get events
GET /api/v4/events/123 - Get a particular event
GET /api/v4/outlets/123
POST /api/v4/friends
GET /api/v4/friends

3. Proxies:
GET /api/v4/wallet - Return the coupons for this user
POST /api/v4/checkin
POST /api/v4/follow
POST /api/v4/share
POST /api/v4/gift

4. Other than this -
- Event processors
- Job framework
- Mail / SMS framework
*/

/*
ROUTES I NEED FOR THE MERCHANT APP

POST /api/v4/outlets

*/
