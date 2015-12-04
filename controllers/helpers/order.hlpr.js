'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var geolib = require('geolib');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var Order = mongoose.model('Order');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var OutletHelper = require('./outlet.hlpr');
var OutletHelper = require('./outlet.hlpr');
var RecoHelper = require('./reco.hlpr');

module.exports.verify_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();

    var data = {};
    data.items = order.items;
    data.outlet = order.outlet;
    data.coords = order.coords;
    data.user_token = token;
    
    
    basic_checks(data)
    .then(function(data){
        return get_user(data);
    }) 
    .then(function(data){
        return get_outlet(data);
    }) 
    .then(function(data){
        return validate_outlet(data);
    })
    .then(function(data){
        return check_item_availability(data);
    })  
    .then(function(data){
        return get_applicable_offer(data);
    })
    .then(function(data) {
      return calculate_order_value(data);
    })
    .then(function(data) {
      return (data);
    })
    .then(function(data) {
      deferred.resolve(data);
    })
    .fail(function(err) {
        console.log(err)
      deferred.reject(err);
    });

    return deferred.promise;
}

module.exports.apply_offer = function(token, offerId) {
    logger.log();
    var deferred = Q.defer();
    
    return deferred.promise;
}

module.exports.checkout = function(token, new_offer) {
    logger.log();
    var deferred = Q.defer();
    
    return deferred.promise;
}

function basic_checks(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;

    if(!passed_data.outlet){
        deferred.reject({
            err: err || true,
            message: 'could not process without outlet'
        });
    }
    
    if(!passed_data.items && passed_data.items.length){
        deferred.reject({
            err: err || true,
            message: 'no item passed'
        });
    }
    if(!passed_data.coords || !passed_data.coords.lat || !passed_data.coords.long){
        deferred.reject({
            err: err || true,
            message: 'user location is not passed'
        });
    }

    deferred.resolve(passed_data);

    return deferred.promise;
}

function get_outlet(data) {
    logger.log();
    var deferred = Q.defer();
    var passed_data = data;

    OutletHelper.get_outlet(passed_data.outlet).then(function(data) {
      passed_data.outlet = data.data;
      deferred.resolve(passed_data);
    }, function(err) {
        deferred.reject({
            err: err || true,
            message: 'Could not find the outlet for this id - ' + passed_data.outlet
        });
    }); 

    return deferred.promise;   
}

function get_user(data) {
    logger.log();
    var deferred = Q.defer();

    var  passed_data = data;
    var token = passed_data.user_token;
    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        if(user.isBlacklisted) {
            deferred.reject({
                err: err || true,
                message: 'you can not order at this outlet'
            });
        }
        else{
            passed_data.user = user;
            deferred.resolve(passed_data);
        }
      }, function(err) {
        deferred.reject({
          err: err || true,
          message: "Couldn\'t find user"
        });
      });
    return deferred.promise;
}

function validate_outlet(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;
    var outlet = passed_data.outlet;

    if(!isOutletActive(outlet)){
        deferred.reject('')
    }
    else if(isOutletClosed(outlet)){
        deferred.reject('')
    }
    else if (!isDeliveryOutlet(outlet)) {
        deferred.reject('');
    }
    else if (isMenuActive(outlet)) {
        deferred.reject('');
    }
    else if (verify_delivery_location(data.coords, outlet)){
        deferred.reject('');
    }
    else{
        deferred.resolve(passed_data);
    }

    return deferred.promise;
}

function calculate_order_value(order, outlet_id, free_item) {
    logger.log();
    var deferred = Q.defer();
    Cache.get('outlets', function(err, reply) {
        if (err) {
          deferred.reject('Could not get outlets');
        } else {
            var menu = {};
            var outlets = JSON.parse(reply);
            var curr_outlet = outlets[outlet_id];
            menu = curr_outlet.menus;
            if(menu) {
                var amount = 0;
                //console.log(menu[1]);
                //console.log(order.items)
                for(var i = 0; i <= order.items.length; i++) {
                    var category = _.findWhere(menu[1].menu_categories, {_id: order.items[i].category_id});
                    console.log(category)
                    
                    var sub_category = _.findWhere(category.sub_categories, {_id: order.items[i].sub_category_id});
                    console.log(sub_category);
                    var item = _.findWhere(sub_category.items, {_id: order.items[i].item_id});
                    console.log(item);
                    var options = _.findWhere(item.options, {_id: order.items[i].option_id});
                    console.log(options);
                    if(options.option_set) {
                        var option = _.findWhere(options.sub_options, {_id: order.items[i].sub_option_id});
                        console.log(option);
                    }
                    if(option_set.add_ons) {
                        var add_on = _.findWhere(options.add_ons, {_id: order.items[i].addon_id});    
                    }
                    
                    
                    amoaunt = amount+option_set.item_cost+option.option_cost+addon_cost;

                    console.log(menu_category);
                    deferred.resolve(menu);     
                }
                 
            }
            else{
                deferred.reject('could not get menu');   
            }
        }
    });
    return deferred.promise;
}

function verify_delivery_location(coords, outlet) {
    //check whether outlet delivers in selected location
    logger.log();

    var outlet_delivery_coords = outlet.attributes.delivery.delivery_coords;
    var is_inside = geolib.isPointInside({latitude: coords.lat, longitude: coords.long},
    outlet_delivery_coords);
    if(is_inside) {
        return true;
    }
    else{
        return false;
    }
}

//check outlet open
function isOutletClosed(outlet) {
    logger.log();
    var date = new Date();
    var time = (parseInt(date.getHours())) +':'+(parseInt(date.getMinutes())+30);
    date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();

    if (outlet && outlet.business_hours ) {
      if(RecoHelper.isClosed(date, time, outlet.business_hours)) {
          return true;
      }
    }
    else{
    return false;
    }
}
// check outlet active
function isOutletActive(outlet) {
    logger.log();

    if(outlet.outlet_meta && outlet.outlet_meta.status === 'active') {
        return true;
    }
    else{
        return false;
    }
}

//check menu active
function isMenuActive(outlet) {
    logger.log();
    if(outlet && outlet.menus) {
        for(var i = 0; i < outlet.menus.length; i++) {

            if(outlet.menus[i].status === 'active') {
              return true;
            }            
            else{
                return false;
            }    
        }            
    }    
}

//check delivery outlet
function isDeliveryOutlet(outlet) {
    logger.log();
    
    if(outlet.attributes.home_delivery) {
        return true;
    }
    else{
        return false;
    }    
}

function check_item_availability(data) {
    logger.log();
    var deferred = Q.defer();
    for(var i = 0; i <= data.items.length; i++) {
             
    }
    deferred.resolve(menu);
    return deferred.promise;
}


function get_applicable_offer(data) {
    logger.log();
    var deferred = Q.defer();

    var offers = data.outlet.offers;
    var user = data.user;
    var date = new Date();
    var time = (parseInt(date.getHours())) +':'+(parseInt(date.getMinutes())+30);
    date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();
    for(var i = 0; i<offers.length; i++) {
        var offer_cost = offers[i].offer_cost || 0;
        
        if(offers[i].offer_status === 'active' && new Date(offers[i].offer_end_date) > new Date()
        && !(RecoHelper.isClosed(date, time, offers[i].actions.reward.reward_hours))
        && data.user.twyst_bucks >= offer_cost && offers[i].offer_type === 'offer' || offers[i].offer_type === 'coupon'){
            console.log('should be here')
            if(offers[i].actions.reward.reward_meta.reward_type === 'free') {
                checkOfferTyeFree(data, data.items, offers[i]);
            }
            else if(offers[i].actions.reward.reward_meta.reward_type === 'bogo') {
                checkOfferTypeBogo(data, data.items, offers[i]);
            }
            else if(offers[i].actions.reward.reward_meta.reward_type === 'discount') {
                checkOfferTypePercentageOff(data, data.items, offers[i]);
            }
            else if(offers[i].actions.reward.reward_meta.reward_type === 'flatoff') {
                checkOfferTypeFlatOff(data, data.items, offers[i]);
            }
        }
    }
    deferred.resolve(data);
    return defer.promise;
}

function checkOfferTyeFree(data, items, offer) {
    logger.log();
    var deferred = Q.defer();
    console.log(items)
    var passed_data = data;
    var id = offer._id;
    for(var i = 0; i < items.length; i++) {
        if(offer.offer_items.category_id === items[i].category_id
            && offer.offer_items.sub_category_id === items[i].sub_category_id
            && offer.offer_items.option_id === items[i].item_id
            && items[i].option_set_id && offer.offer_items.sub_option_id === items[i].option_set_id
            && items[i].addon_id && offer.offer_items.sub_option_id.add_ons === items[i].addon_id){
            _.each(data.outlet.offers, function(offer){
                if(offer._id === id){
                    console.log('new_offer')
                    offer.is_applicable = true;
                    item[i].is_free = true;
                    deferred.resolve(data);
                }
            })        
        }
        else{
            _.each(data.outlet.offers, function(offer){
                if(offer._id === id){
                    console.log('new_offer')
                    offer.is_applicable = false;
                    item[i].is_free = true;
                    deferred.resolve(data);
                }
            })    
        }
    }   
    console.log(data.outlet.offers);
    return deferred.promise;
}

function checkOfferTypeBogo(token, items, offer) {
    logger.log();
    for(var i = 0; i<offers.length; i++) {
        if(offers[i].actions.reward.reward_meta.type === 'Bogo') {

        }
    }
}

function checkOfferTypeFlatOff(token, items, offer) {
    logger.log();
    for(var i = 0; i<offers.length; i++) {
        if(offers[i].actions.reward.reward_meta.type === 'FlatOff') {

        }
    }

}

function checkOfferTypePercentageOff(token, items, offer) {
    logger.log();
    for(var i = 0; i<offers.length; i++) {
        if(offers[i].actions.reward.reward_meta.type === 'PercentageOff') {

        }
    }

}


