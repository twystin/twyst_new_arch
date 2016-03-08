var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var RecoHelper = require('../helpers/reco.hlpr.js');
var CashbackOffer = mongoose.model('CashbackOffer');
var User = mongoose.model('User');
var Transporter = require('../../transports/transporter.js');
var Utils = require('../../common/datetime.hlpr.js');
var TemplatePath      = require('../../config/templatePath.js');
var PayloadDescriptor = require('../../common/email.hlpr.js');
var MailContent       = require('../../common/template.hlpr.js');
var Email             = require('../../transports/email/ses.transport.js');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var offer = _.get(passed_data, 'event_data.offer_id');

  if (!offer) {
    deferred.reject({
        message: 'Use cashback offer needs offer id.'
    });
  } else {
    deferred.resolve(passed_data);
  }
  return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var user = _.get(passed_data, 'user');
    var offer_id = _.get(passed_data, 'event_data.offer_id');
    var available_twyst_cash =  _.get(passed_data, 'user.twyst_cash');

    if(user.validation && user.validation.email){
        CashbackOffer.findOne({'offers._id': offer_id }, function(err, cashback_partner){
            if(err || !cashback_partner) {
                console.log( 'error'+ err);
                deferred.reject({
                    message: 'This offer is no more available 1'
                });
            }
            else if(cashback_partner && cashback_partner.offers && cashback_partner.offers.length){
              console.log("found list of offers");
                var matching_offer = getMatchingOffer(cashback_partner.offers, offer_id);
                console.log("found offers");
                if(matching_offer && matching_offer.currently_available_voucher_count){
                    var is_enough_twyst_cash = check_enough_twyst_cash(matching_offer, available_twyst_cash);
                    console.log("twyst cash: " + available_twyst_cash);
                    if(is_enough_twyst_cash){
                        user.twyst_cash = user.twyst_cash - matching_offer.offer_cost - matching_offer.offer_processing_fee;
                        update_offer_count(cashback_partner._id, matching_offer, user._id, user.twyst_cash).then(function(data) {

                            var egv_details = matching_offer.offer_detail[0];
                            send_email(user, egv_details, matching_offer).then(function(data) {
                                passed_data.event_data.event_meta = {};
                                passed_data.event_data.event_meta = matching_offer;
                                deferred.resolve(passed_data);
                            })

                        })
                    } else{
                        deferred.reject({
                            message: 'Not enough Twyst Cash'
                        });
                    }

                } else {
                    deferred.reject({
                        message: 'This offer is no more available 2'
                    });
                }

            } else {
                deferred.reject({
                    message: 'This offer is no more available 3'
                });
            }
        })
    }
    else if(user.validation && user.validation.sent_email_count
        && user.validation.sent_email_count >= 3) {
        deferred.reject({
            err: false,
            message: 'email id is not verified',
            data: false
        })
    }
    else{
        deferred.reject({
            err: false,
            message: 'email id is not verified',
            data: true
        });
    }
    return deferred.promise;
}

function getMatchingOffer(offers, offer_id){
    logger.log();
    for (var i = 0; i < offers.length; i++) {
        if(offers[i]._id.toString() === offer_id.toString()) {
            return   offers [i];
        }
    }
    return null;
}

function check_enough_twyst_cash (offer, twyst_cash) {
    logger.log();
    if(offer.offer_cost+offer.offer_processing_fee <= twyst_cash) {
        return true;
    }
    else{
        return false;
    }
}


function update_offer_count(partner_id, offer, user_id, twyst_cash) {
    logger.log();
    var deferred = Q.defer();
    console.log(user_id)
    console.log(twyst_cash)
    var available_voucher_count = offer.currently_available_voucher_count - 1;
    var update = {
        $set: {
            "offers.$.currently_available_voucher_count": available_voucher_count
        }
    }

    CashbackOffer.update({
        _id: partner_id,
        'offers._id': offer._id
        },
        update,
        function(err, cashback_partner) {
        if(err || !cashback_partner) {
            console.log('offer save err', err);
            deferred.reject({
                message: 'This offer is no more available 4'
            });
        }
        else{
            User.findOneAndUpdate({_id: user_id}, {
                $set: {twyst_cash: twyst_cash}
            }).exec(function(err, user) {
                if (err || !user) {
                    logger.error(err);
                    deferred.reject('The customer in not on Twyst');
                }
                else{
                    deferred.resolve({
                        data: available_voucher_count,
                        message: 'we have sent you an email regarding offer code'
                    });
                }
            });

        }
    })

    return deferred.promise;
}

function send_email(user, egv_details, offer) {
    logger.log();
    var deferred = Q.defer();
    console.log(offer.offer_source);
    var filler = {
      name       : user.first_name,
      amount     : offer.offer_value,
      brand      : "Flipkart",
      gvcode     : egv_details.egv_code,
      gvpin      : egv_details.egv_id,
      valid_till : offer.offer_end_date,
      tnc        : offer.offer_tnc
    };
    console.log(filler);
    console.log(TemplatePath.of('redeem.hbs'));
    MailContent.templateToStr(TemplatePath.of('redeem.hbs'), filler, function(message){
      var payload = new PayloadDescriptor('utf-8', user.email, 'New Offer!', message, 'kuldeep@twyst.in');
      console.log(payload);
      Email.send(payload).then(
        function(res){
          deferred.resolve(res);
      }, function (err){
          deferred.reject(err);
      });
    });

    /*Transporter.send('email', 'ses', payload).then(function(reply) {
        deferred.resolve(reply);
    }, function(err) {
        console.log('mail failed', err);
        deferred.reject(reply);
    });*/
    deferred.resolve(user);
    return deferred.promise;
}
