var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var RecoHelper = require('../helpers/reco.hlpr.js');
var CashbackOffer = mongoose.model('CashbackOffer');
var User = mongoose.model('User');
var Transporter = require('../../transports/transporter.js');
var Utils = require('../../common/datetime.hlpr.js');



module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;
  var offer = _.get(passed_data, 'event_data.offer_id');
  
  if (!offer) {
    deferred.reject('Use cashback offer needs offer id.');
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
                console.log( 'error '+ err);
                deferred.reject('Could not find outlet to generate coupon');
            }
            else if(cashback_partner && cashback_partner.offers && cashback_partner.offers.length){
                var matching_offer = getMatchingOffer(cashback_partner.offers, offer_id);
                if(matching_offer && matching_offer.currently_available_voucher_count){
                    var is_enough_twyst_cash = check_enough_twyst_cash(matching_offer, available_twyst_cash);
                    if(is_enough_twyst_cash){
                        user.twyst_cash = user.twyst_cash - matching_offer.offer_cost - matching_offer.offer_processing_fee;
                        update_offer_count(cashback_partner._id, matching_offer, user._id, user.twyst_cash).then(function(data) {                            
                            
                            var egv_details = matching_offer.offer_detail[data.data];
                        
                            send_email(user, egv_details, matching_offer).then(function(data) {
                                passed_data.event_data.event_meta = {};
                                passed_data.event_data.event_meta = matching_offer;
                                deferred.resolve(passed_data); 
                            })
                            
                        })       
                    }
                    else{
                        deferred.reject('Not enough twyst cash');
                    }
                      
                }
                else {
                  deferred.reject('This offer is no more available');
                }
                 
            }
            else {
                deferred.reject('This offer is no more available');
            }
        })
    }
    else if(user.validation && user.validation.sent_email_count 
        && user.validation.sent_email_count >= 3) {
        deferred.reject('email id is not verified');    
    }
    else{
        deferred.reject('email id is not verified');     
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
            deferred.reject('This offer is no more available');
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

    var payload = {
        Destination: { 
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [ 'kuldeep@twyst.in'] //, merchant_email
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data: 
                    "<h4>Detail</h4>" + egv_details.egv_id+
                    "<h4>Detail2</h4>" + egv_details.egv_code
                    
    
                },
                Text: {
                    Data: 'Voucher Detail'
                    
                }
            },
            Subject: { /* required */
              Data: 'Online Shopping Voucher from Twyst', /* required */
              
            }
        },
        Source: 'info@twyst.in',
        ReturnPath: 'info@twyst.in' 
    };

    /*Transporter.send('email', 'ses', payload).then(function(reply) {
        deferred.resolve(reply);
    }, function(err) {
        console.log('mail failed', err);
        deferred.reject(reply);
    });*/
    deferred.resolve(user);
    return deferred.promise;
}   