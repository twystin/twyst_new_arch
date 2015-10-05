'use strict';
/*jslint node: true */

var mustBe = require('mustbe').routeHelpers();

var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  (function WepAppRoutes() {
    app.get('', function(req, res) { res.redirect('/home'); });
    app.get('/', function(req, res) { res.redirect('/home'); });
  })();

  (function AccountRoutes() {
    var AccountCtrl = require('../controllers/account.ctrl');
    app.post('/api/v4/auth/register', AccountCtrl.register_merchant);
    app.post('/api/v4/accounts/login', function(req, res, next) {
        next();
      }, passport.authenticate('account'),
      AccountCtrl.login);

    app.get('/api/v4/authcode/:phone', AccountCtrl.create_authcode);
    app.post('/api/v4/authcode', AccountCtrl.verify_authcode_and_create_account);
    app.get('/api/v4/accounts/logout', AccountCtrl.logout);

  })();

  (function RecoRoutes() {
    var RecoCtrl = require('../controllers/reco.ctrl');
    app.get('/api/v4/recos', RecoCtrl.get);
  })();

  (function EventRoutes() {
    var EventCtrl = require('../controllers/event.ctrl');
    app.get('/api/v4/events', EventCtrl.list_events);
    app.get('/api/v4/events/retrieve/:event_id', EventCtrl.get_event);
    var NotifCtrl = require('../controllers/notif.ctrl');
    app.get('/api/v4/events/:event_id', NotifCtrl.get_notif);
    app.put('/api/v4/events/:event_id', EventCtrl.update_event);
    app.post('/api/v4/events', EventCtrl.new);

    app.post('/api/v4/coupon/gift', EventCtrl.gift);
    app.post('/api/v4/coupon/grab', EventCtrl.grab);
    app.post('/api/v4/coupon/redeem', EventCtrl.redeem); // FOR COUPON TYPE
    app.post('/api/v4/offer/generate/coupon', EventCtrl.generate_coupon); // FOR OFFER TYPE
    app.post('/api/v4/deal/log', EventCtrl.deal_log); // FOR DEAL TYPE

    app.post('/api/v4/checkin/bill', EventCtrl.upload_bill);
    app.post('/api/v4/checkin/qr', EventCtrl.qr_checkin);
    app.post('/api/v4/checkin/panel', EventCtrl.panel_checkin);
    app.post('/api/v4/checkin/batch', EventCtrl.batch_checkin);

    app.post('/api/v4/outlet/follow', EventCtrl.follow);
    app.post('/api/v4/outlet/unfollow', EventCtrl.unfollow);
    app.post('/api/v4/outlet/feedback', EventCtrl.feedback);
    app.post('/api/v4/outlet/share', EventCtrl.share_outlet);
    app.post('/api/v4/outlet/suggestion', EventCtrl.suggestion);

    app.post('/api/v4/offer/submit', EventCtrl.submit_offer);
    app.post('/api/v4/offer/like', EventCtrl.like_offer);
    app.post('/api/v4/offer/unlike', EventCtrl.unlike_offer);
    app.post('/api/v4/offer/share', EventCtrl.share_offer);
    app.post('/api/v4/offer/extend', EventCtrl.extend_offer);
    app.post('/api/v4/offer/report/problem', EventCtrl.report_problem);

    app.post('/api/v4/referral/join', EventCtrl.referral_join);

    app.post('/api/v4/comments/', EventCtrl.comments);
  })();

  (function OutletRoutes() {
    var OutletCtrl = require('../controllers/outlet.ctrl');
    app.post('/api/v4/outlets', mustBe.authorized('outlet.create', OutletCtrl.new));
    app.get('/api/v4/outlets/:outlet_id/code/:code', mustBe.authorized('outlet.view', OutletCtrl.get_coupon_by_code));
    app.get('/api/v4/outlets/:outlet_id/phone/:phone', mustBe.authorized('outlet.view', OutletCtrl.get_user_coupons));
    app.post('/api/v4/outlets/redeem_user_coupon', OutletCtrl.redeem_user_coupon);
    app.put('/api/v4/outlets/:outlet_id', mustBe.authorized('outlet.update', OutletCtrl.update));

    // Anonymous route
    app.get('/api/v4/outlets/:outlet_id', OutletCtrl.get);
    app.get('/api/v4/outlets', mustBe.authorized('outlet.view', OutletCtrl.all));
    app.delete('/api/v4/outlets/:outlet_id', mustBe.authorized('outlet.remove', OutletCtrl.remove));
  })();

  (function OfferRoutes() {
    var OfferCtrl = require('../controllers/offer.ctrl');
    app.post('/api/v4/offers', OfferCtrl.new);
    app.put('/api/v4/offers/:offer_id', mustBe.authorized('outlet.update', OfferCtrl.update));
    app.get('/api/v4/offers/:offer_id', mustBe.authorized('outlet.view', OfferCtrl.get));
    app.delete('/api/v4/offers/:offer_id', mustBe.authorized('outlet.update', OfferCtrl.delete));
  })();

  (function ImageRoutes() {
    var ImageCtrl = require('../controllers/image.ctrl');
    app.post('/api/v4/images', ImageCtrl.uploadImage);
    app.post('/api/v4/images/clone', ImageCtrl.cloneImage);
  })();

  (function UserRoutes() {
    var UserCtrl = require('../controllers/user.ctrl');
    app.get('/api/v4/profile', UserCtrl.get_profile);
    app.put('/api/v4/profile', UserCtrl.update_profile);
    app.put('/api/v4/friends', UserCtrl.update_friends);
    app.get('/api/v4/coupons', UserCtrl.get_coupons);
    app.post('/api/v4/user/location', UserCtrl.update_location);
  })();

  (function LocationRoutes() {
    var LocationCtrl = require('../controllers/location.ctrl');
    app.get('/api/v4/locations', LocationCtrl.get_locations);
  })();

  (function SearchRoutes() {
    var SearchCtrl = require('../controllers/search.ctrl');
    app.get('/api/v4/search', SearchCtrl.search);
  })();

  (function QR_Routes() {
      var QrCtrl = require('../controllers/qr.ctrl');
      app.post('/api/v4/qr/outlets',  QrCtrl.qr_create);
  })();

  (function LegacyRoutes() {
    app.get('/app', function(req, res) {
        res.redirect('https://play.google.com/store/apps/details?id=com.twyst.app.android&hl=en');
    });
    app.all('/api/v1/*', function(req, res) { res.redirect('http://staging.twyst.in' + req.url) });
    app.all('/api/v2/*', function(req, res) { res.redirect('http://staging.twyst.in' + req.url) });
    app.all('/api/v3/*', function(req, res) { res.redirect('http://staging.twyst.in' + req.url) });
    app.all('/:shortUrl(*)', function(req, res) { res.redirect('http://staging.twyst.in' + req.url) });
  })();
};


