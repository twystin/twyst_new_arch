var logger = require('tracer').colorConsole();
var _ = require('lodash');
var Q = require('q');
var mongoose = require('mongoose');
var RecoHelper = require('../helpers/reco.hlpr.js');
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');

module.exports.check = function(data) {
  logger.log();
  var deferred = Q.defer();
  var passed_data = data;

  var type = _.get(passed_data, 'event_data.event_meta.type');
  var offer = _.get(passed_data, 'event_data.event_meta.offer');
  var outlet = _.get(passed_data, 'event_data.event_outlet');
  
  if (!type || !offer) {
    deferred.reject('Generate coupon needs type and offer.');
  } else {
    deferred.resolve(passed_data);
  }
  deferred.resolve(passed_data);
  return deferred.promise;
};

module.exports.process = function(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;
    var user = _.get(passed_data, 'user._id');
    var offer_id = _.get(passed_data, 'event_data.event_meta.offer');
    var outlet_id = _.get(passed_data, 'event_data.event_outlet');
    var available_twyst_bucks =  _.get(passed_data, 'user.twyst_bucks');

    Outlet.findOne({_id: outlet_id }, function(err, outlet){
        if(err || !outlet) {
            console.log( 'error '+ err);
            deferred.reject('Could not find outlet to generate coupon');
        }
        else if(isOutletClosed(outlet)) {            
            deferred.reject('Outlet is currently closed');
        }
        else if(outlet && outlet.offers && outlet.offers.length){
            var matching_offer = getMatchingOffer(outlet.offers, offer_id);
            if(matching_offer){
                var is_enough_bucks = check_enough_twyst_buck(matching_offer, available_twyst_bucks);
                if(is_enough_bucks){
                    create_coupon(matching_offer, user, outlet_id).then(function(data) {
                        
                        if(data.coupons && data.coupons.length) {
                            passed_data.user.coupons.push(data.coupons[data.coupons.length-1]);
                        }

                        deferred.resolve(passed_data);
                    }, function(err) {
                        deferred.reject('Could not create coupon');
                    })      
                }
                else{
                    deferred.reject('Not enough twyst bucks');
                }
                  
            }
            else {
              deferred.reject('Offer is not valid at this outlet');
            }
             
        }
        else {
            deferred.reject('There is no offer at this outlet');
        }
    })
    return deferred.promise;
}

function isOutletClosed(outlet) {
    if (outlet && outlet.business_hours ) {
        if(RecoHelper.isClosed('dummy', 'dummy', outlet.business_hours)) {
            return true;
        }
    }
    else{
      return false;
    }
}

function getMatchingOffer(offers, offer_id){
    for (i = 0; i < offers.length; i++) {
        if(offers[i]._id.toString() === offer_id.toString()) {
            return   offers [i];       
        }
    }
    return null;
}

function check_enough_twyst_buck (offer, bucks) {
    if(offer.offer_cost <= bucks) {
        return true;
    }
    else{
        return false;
    }
}


function create_coupon(offer, user, outlet) {
  logger.log();
  var keygen = require('keygenerator');
  var code = keygen._({
    forceUppercase: true,
    length: 6,
    exclude: ['O', '0', 'L', '1']
  });

  var deferred = Q.defer();
  var outlets = [];
  outlets.push(outlet);
  var update = {
    $push: {
      coupons: {
        _id: mongoose.Types.ObjectId(),
        code: code,
        issued_for: offer._id,
        coupon_source:  'exclusive_offer',
        header: offer.actions.reward.header,
        line1: offer.actions.reward.line1,
        line2: offer.actions.reward.line2,        
        expiry_date: new Date(),
        meta: {
          reward_type: {
            type: offer.actions.reward.reward_meta.reward_type
          }
        },
        status: 'active',
        issued_at: new Date(),
        issued_by: outlet,
        outlets: offer.offer_outlets
      }
    }
  };
  User.findOneAndUpdate({
    _id: user
  }, update, function(err, updated_user) {
    if (err || !user) {
      deferred.reject('Could not update user');
    } else
      deferred.resolve(updated_user);
  });

  return deferred.promise;
}

