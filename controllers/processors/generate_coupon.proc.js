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
    var outlet = _.get(passed_data, 'event_data.event_outlet'); 

    Outlet.findOne({_id: outlet }, function(err, outlet){
        if(err || !outlet) {
            deferred.reject('Could not find outlet to generate coupon');
        }
        else if(isOutletClosed(outlet)) {            
            deferred.reject('Outlet is currently closed');
        }
        else if(outlet && outlet.offers && outlet.offers.length){
            var matching_offer = getMatchingOffer(outlet.offers, offer_id);
            if(matching_offer){

                create_coupon(matching_offer, user, outlet).then(function(data) {
                    deferred.resolve(passed_data);
                }, function(err) {
                    deferred.reject('Could not create coupon');
                })    
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
        outlets: outlets,
        coupon_source: {
          type: 'exclusive_offer'
        },
        header: offer.actions.reward.header,
        line1: offer.actions.reward.line1,
        line2: offer.actions.reward.line2,
        lapse_date: new Date(),
        expiry_date: new Date(),
        meta: {
          reward_type: {
            type: 'need to fix' // to fix = where from?
          }
        },
        status: 'active',
        issued_at: new Date()
      }
    }
  };
  User.findOneAndUpdate({
    _id: user
  }, update, function(err, user) {
    if (err || !user) {
      deferred.reject('Could not update user');
    } else
      deferred.resolve(user);
  });

  return deferred.promise;
}

