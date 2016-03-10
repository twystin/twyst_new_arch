'use strict';
/*jslint node: true */

var mustBe = require('mustbe').routeHelpers();

var mongoose = require('mongoose');
var passport = require('passport');
module.exports = function(app) {

  (function WepAppRoutes() {
    var MiscCtrl = require('../controllers/misc.ctrl');
    app.get('', function(req, res) { res.redirect('/home'); });
    app.get('/', function(req, res) { res.redirect('/home'); });
    app.get('/api/v4/earn/more', function(req, res) { res.contentType('text/html'); res.end("<ul><li>Upload your bill every time you visit or order from a Twyst outlet.</li><li>Invlite friends to join you on Twyst - get Twyst cash for each friends who joins.</li><li>Submit offers!</li><li>Suggest outlets you want on Twyst.</li><li>Favourite an outlet.</li><li>Like an offer</li></ul>"); });
    app.get('/api/v4/faq', function(req, res) { 
      res.redirect('/home/faq.html'); 
    });
    app.post('/api/v4/get_link', MiscCtrl.send_link);
    app.get('/api/v4/send/verification/email', MiscCtrl.send_verification_email);

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
    app.get('/verify/email/:token', AccountCtrl.verify_email);    
  })();

  (function RecoRoutes() {
    var RecoCtrl = require('../controllers/reco.ctrl');
    var DeliveryRecoCtrl = require('../controllers/delivery_reco.ctrl');
    app.get('/api/v4/recos', RecoCtrl.get);
    app.get('/api/v4/delivery/recos', DeliveryRecoCtrl.get);
  })();

  (function EventRoutes() {
    var EventCtrl = require('../controllers/event.ctrl');
    var PosEventCtrl = require('../controllers/processors/pos_checkin.proc');
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
    app.post('/api/v4/shopping/offers/use', EventCtrl.use_shopping_offer);

    app.post('/api/v4/checkin/bill', EventCtrl.upload_bill);
    app.post('/api/v4/checkin/qr', EventCtrl.qr_checkin);
    app.post('/api/v4/checkin/panel', EventCtrl.panel_checkin);
    app.post('/api/v4/checkin/bulk', EventCtrl.bulk_checkin);
    app.post('/api/v4/checkin/mrl', EventCtrl.mrl_checkin);
    app.post('/api/v4/checkin/pos', PosEventCtrl.pos_checkin);

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

    app.post('/api/v4/menu/request_update', EventCtrl.request_menu_update);

    app.post('/api/v4/referral/join', EventCtrl.referral_join);

    app.post('/api/v4/comments/', EventCtrl.comments);
    app.post('/api/v4/contact_us', EventCtrl.contact_us);    
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
    app.get('/api/v4/outlet/orders/:outlet_id', OutletCtrl.get_orders);
    app.put('/api/v4/outlet/order/:order_id', OutletCtrl.update_order);
  })();

  (function OfferRoutes() {
    var OfferCtrl = require('../controllers/offer.ctrl');
    app.post('/api/v4/offers', OfferCtrl.new);
    app.get('/api/v4/offers', OfferCtrl.all);
    app.get('/api/v4/offers/outlet/:outlet_id', OfferCtrl.get_offers);
    app.put('/api/v4/offers/:offer_id', mustBe.authorized('outlet.update', OfferCtrl.update));
    app.get('/api/v4/offers/:offer_id', mustBe.authorized('outlet.view', OfferCtrl.get));
    app.delete('/api/v4/offers/:offer_id', mustBe.authorized('outlet.update', OfferCtrl.delete));

  })();

  (function CashbackOfferRoutes() {
    var CashbackOfferCtrl = require('../controllers/cashback_offer.ctrl');
    app.post('/api/v4/cashback/offers', CashbackOfferCtrl.create);
    app.get('/api/v4/cashback/offers', CashbackOfferCtrl.all);
    app.put('/api/v4/cashback/offers/:offer_id', CashbackOfferCtrl.update);
    app.get('/api/v4/cashback/offers/:offer_id', CashbackOfferCtrl.get);
    app.delete('/api/v4/cashback/offers/:offer_id', CashbackOfferCtrl.delete);

  })();

  (function MenuRoutes() {
    var MenuCtrl = require('../controllers/menu.ctrl');
    app.post('/api/v4/menu', MenuCtrl.new);
    app.get('/api/v4/menu', MenuCtrl.all);
    app.post('/api/v4/menus/clone', mustBe.authorized('outlet.update', MenuCtrl.clone));
    app.put('/api/v4/menus/:menu', mustBe.authorized('outlet.update', MenuCtrl.update));
    app.get('/api/v4/menus/:menu', MenuCtrl.get);    
    app.delete('/api/v4/menus/:menu', mustBe.authorized('outlet.update', MenuCtrl.delete));
  })();

  (function OrderRoutes() {
    var OrderCtrl = require('../controllers/order.ctrl');    
    app.get('/api/v4/orders', OrderCtrl.all);
    app.get('/api/v4/order/:order_id', OrderCtrl.get_order);
    app.put('/api/v4/order', OrderCtrl.update_order);
    app.post('/api/v4/order/verify', OrderCtrl.verify_order);
    app.post('/api/v4/order/apply/offer', OrderCtrl.apply_offer);
    app.post('/api/v4/order/checkout', OrderCtrl.checkout);
    app.post('/api/v4/order/confirm', OrderCtrl.confirm_order);

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
    app.post('/api/v4/user/cancel_order', UserCtrl.cancel_order);
    app.get('/api/v4/user/twyst/cash/history', UserCtrl.twyst_cash_history);
  })();

  (function LocationRoutes() {
    var LocationCtrl = require('../controllers/location.ctrl');
    app.get('/api/v4/locations', LocationCtrl.get_locations);
    app.get('/api/v4/locations/outlets', LocationCtrl.get_outlet_locations);
    app.post('/api/v4/locations/verify', LocationCtrl.verify_delivery_location);
  })();

  (function SearchRoutes() {
    var SearchCtrl = require('../controllers/search.ctrl');
    app.get('/api/v4/search', SearchCtrl.search);
  })();

  (function QR_Routes() {
      var QrCtrl = require('../controllers/qr.ctrl');
      app.get('/api/v4/qr', QrCtrl.qr_list);
      app.post('/api/v4/qr/outlets',  QrCtrl.qr_create);
      app.put('/api/v4/qr/:qr_id', QrCtrl.qr_update);
  })();

  (function Mobikwik_Payment_Routes(){
    var MobikwikPaymentCtrl = require('../controllers/mobikwik_payment.ctrl');
    app.post('/api/v4/zaakpay/response', MobikwikPaymentCtrl.get_zaakpay_response);
    app.post('/api/v4/calculate/checksum', MobikwikPaymentCtrl.calculate_checksum);
    app.post('/api/v4/zaakpay/refund', MobikwikPaymentCtrl.initiate_refund);
    
  })();

  (function Paytm_Payment_Routes(){
    var PaytmPaymentCtrl = require('../controllers/paytm_payment.ctrl');    
    app.post('/api/v4/calculate/checksum', PaytmPaymentCtrl.calculate_checksum);
    app.post('/api/v4/paytm/response', PaytmPaymentCtrl.get_paytm_response);
  })();

  (function Recharge_Routes(){
    var RechargeCtrl = require('../controllers/recharge.ctrl');
    app.post('/api/v4/mobikwik/recharge', RechargeCtrl.send_recharge_request);
    
  })();

  (function LegacyRoutes() {
    app.get('/app', function(req, res) {
        res.redirect('https://play.google.com/store/apps/details?id=com.twyst.app.android&hl=en');
    });
    app.get('/privacy_policy/', function(req, res){
      res.redirect('../../privacy_policy.pdf');    
    });

    app.get('/terms_of_use/', function(req, res){
      res.redirect('../../terms_of_use.pdf');    
    });
    app.get('/:url(*)', function(req, res){
      res.redirect('../../home/404.html')
    })
    
  })();

  
};


