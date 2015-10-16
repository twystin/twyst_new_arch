'use strict';
/*jslint node: true */

var mustBe = require('mustbe').routeHelpers();

var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  (function WepAppRoutes() {
    app.get('', function(req, res) { res.redirect('/home'); });
    app.get('/', function(req, res) { res.redirect('/home'); });
    app.get('/api/v4/earn/more', function(req, res) { res.contentType('text/html'); res.end("<ul><li>Upload your bill every time you visit or order from a Twyst outlet.</li><li>Invlite friends to join you on Twyst - get Twyst bucks for each friends who joins.</li><li>Submit offers!</li><li>Suggest outlets you want on Twyst.</li><li>Favourite an outlet.</li><li>Like an offer</li></ul>"); });
    app.get('/api/v4/faq', function(req, res) { res.contentType('text/html'); res.end('<h3>How to Twyst</h3> <ul> <li><strong>How do I use Twyst</strong> <p>It\'s easy - scroll or search for the offer you are looking for, and tap \'Use Offer\' to use them! Most offers are available to use immediately, some can be unlocked when tou check-in. You can plan ahead as well, by tapping on your current location and choosing a different location, date or time</p></li> <li><strong>What\'s the number I sometimes see next to \'Use Offer\'?</strong> <p>That number signifies the cost of the offer in Twyst Bucks. Twyst Bucks are the points on Twyst, that you need to use some offers. You can anso use Twyst Bucsk to extend your coupons and grab your friends coupons</p> </li> <li> <strong>So, how do I earn Twyst Bucks</strong> <p>You can earn Twyst Bucks each time you check-in by upload a restaurant bill or scanning a QR Code. You can also invite friends to join you on Twyst, and get 250 Twyst Bucsk for each friend who joins Twyst on yout invitation. Also earn Twyst Bucks when you follow an outlet, like an offer, submit an offer and suggest an outlet on Twyst.</p> </li> <li> <strong>Why should I upload the bill?Can I upload from home?</strong> <p>Uploading a bill is a way of checking in at an outlet. You can upload your bills whether you went out to eat or ordered in. One bill can be uploaded only once for approval. When an uploaded bill is approved, you get a check-in at that outlet, and some Twyst Bucks!</p> </li> <li> <strong>On Twyst, what are friends for?</strong> <p>To get you more offers, thats what! Get 250 Twyst Bucks for each friend who joins Twyst on your invitation - use those Bucks to use some yummy offers! Whats more, when your friends check-in and unlock some cool coupons, you get to Grab and use those coupons as well. Remember, they too get to grab the coupons you unlock!</p> </li> <li> <strong>What are \'Grab Offer\' and \'Extend\'</strong> <p>Grab Offer is how you yse your friend\'s coupon. If a friend has checked-in and unlocked a coupon, but has not used it till the lapse date, the voucher becomes available to you ( and all his other friends on Twyst) to \'GRAB\'. Once grabbed, the coupon goes into your Wallet and is exclusively available to you until it expires.</p> <p /> <p>If you have unlocked a coupon, and the lapse date is coming up, but you do not wish your friends to be able to grab it (its\' good to be selfish sometimes!), you can extend the coupon till its expiry date. When you extend it, your friends do not get to see or grab your coupon.</p> <p /> <p>You need to use Twyst Bucks to grab as well as extend coupons.</p> </li> </ul> <br /><br /> <p>For more, write to us at <a href="mailto:support@twyst.in"><strong>support@twyst.in</strong></a></p>'); });
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
    //app.get('/api/v4/events', EventCtrl.list_events);
    app.get('/api/v4/events/list/:event_type', EventCtrl.list_events);
    app.get('/api/v4/events/retrieve/:event_id', EventCtrl.get_event);
    app.put('/api/v4/events/update/:event_id', EventCtrl.update_event);
    var NotifCtrl = require('../controllers/notif.ctrl');
    app.get('/api/v4/events/:event_id', NotifCtrl.get_notif);
    
    app.post('/api/v4/events', EventCtrl.new);

    app.post('/api/v4/coupon/gift', EventCtrl.gift);
    app.post('/api/v4/coupon/grab', EventCtrl.grab);
    app.post('/api/v4/coupon/redeem', EventCtrl.redeem); // FOR COUPON TYPE
    app.post('/api/v4/offer/generate/coupon', EventCtrl.generate_coupon); // FOR OFFER TYPE
    app.post('/api/v4/deal/log', EventCtrl.deal_log); // FOR DEAL TYPE

    app.post('/api/v4/checkin/bill', EventCtrl.upload_bill);
    app.post('/api/v4/checkin/qr', EventCtrl.qr_checkin);
    app.post('/api/v4/checkin/panel', EventCtrl.panel_checkin);
    app.post('/api/v4/checkin/bulk', EventCtrl.bulk_checkin);

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
    app.get('/api/v4/locations/outlets', LocationCtrl.get_outlet_locations);
  })();

  (function SearchRoutes() {
    var SearchCtrl = require('../controllers/search.ctrl');
    app.get('/api/v4/search', SearchCtrl.search);
  })();

  (function QR_Routes() {
      var QrCtrl = require('../controllers/qr.ctrl');
      app.get('/api/v4/qr', QrCtrl.qr_list);
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


