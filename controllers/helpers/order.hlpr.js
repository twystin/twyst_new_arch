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
        var updated_data = {};
        updated_data.items = data.items;
        updated_data.order_value = data.order_value;
        updated_data.offers = [];
        
        _.each(data.outlet.offers, function(offer){
            if(offer.order_value)  {
                var massgaed_offer = {};
                massgaed_offer._id = offer._id;
                massgaed_offer.is_applicable = offer.is_applicable;
                massgaed_offer.order_value = offer.order_value;
                massgaed_offer.offer_type = offer.actions.reward.reward_meta.reward_type;
                if(offer.free_item) {
                    updated_data.free_item = offer.free_item;
                }
                updated_data.offers.push(massgaed_offer);    
            }        
        })
        
        deferred.resolve(updated_data);
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
        deferred.reject({
          err:  true,
          message: "outlet is not active"
        });
    }
    else if(isOutletClosed(outlet)){
        deferred.reject({
          err:  true,
          message: "outlet is currently closed"
        });
    }
    else if (!isDeliveryOutlet(outlet)) {
        deferred.reject({
          err:  true,
          message: "outlet does not delivers"
        });
    }
    else if (!isMenuActive(outlet)) {
        deferred.reject({
          err:  true,
          message: "menu is not active"
        });
    }
    else if (verify_delivery_location(data.coords, outlet)){
        deferred.reject({
          err:  true,
          message: "outlet does not delivers at selected loation"
        });
    }
    else{
        deferred.resolve(passed_data);
    }

    return deferred.promise;
}

function calculate_order_value(data, free_item) {
    logger.log();
    console.log('free_item ' + free_item);
    var passed_data = data;
    var items = data.items
    var menu = {};
    menu = data.outlet && data.outlet.menus[0];
    var items = data.items;
    var category, sub_category, item, option, sub_option, add_on, amount = 0;
    
    for(var i = 0; i < items.length; i++) {
        category = _.findWhere(menu.menu_categories, {_id: items[i].category_id});
        
        var sub_category = _.findWhere(category.sub_categories, {_id: items[i].sub_category_id});
        item = _.findWhere(sub_category.items, {_id: items[i].item_id});
        if(item.options && items[i].option_id) {
            option = _.findWhere(item.options, {_id: items[i].option_id});
            console.log(option);    
        }
        
        if(option && option.sub_options && items[i].sub_options) {
            sub_option = _.findWhere(option.sub_options, {_id: items[i].sub_option_id});
        }
        if(option && option.add_ons && items[i].addon_id) {
            add_on = _.findWhere(option.add_ons, {_id: items[i].addon_id});    
        }
        console.log(items[i].quantity +'quantity')
        if(item._id === free_item && option) {
            amount = amount+(option.option_cost*(items[i].quantity-1));           
        }
        else if(item._id === free_item && !option) {
            amount = amount+(item.item_cost*(items[i].quantity-1));           
            
        }         
        else if(option){
            amount = amount+(option.option_cost*items[i].quantity);            
        }
        else {
            amount = amount+(item.item_cost*items[i].quantity);               
        }
    }
    console.log('order amount '+ amount);
    return amount;
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
            console.log(outlet.menus[i].status)
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
    deferred.resolve(data);
    return deferred.promise;
}


function get_applicable_offer(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;
    var user = passed_data.user;
    var date = new Date();
    var time = (parseInt(date.getHours())) +':'+(parseInt(date.getMinutes())+30);
    date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();
    var i, offer_cost = 0;
    _.each(passed_data.outlet.offers, function(offer){
        offer.is_applied = false;
    })
    passed_data.outlet.offers = _.map(data.outlet.offers, function(offer) {
        offer_cost = offer.offer_cost || 0;
        //console.log(offers[i].actions.reward.reward_meta.reward_type)
        if(offer.offer_status === 'active' && new Date(offer.offer_end_date) > new Date()
        && !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours))
        && data.user.twyst_bucks >= offer_cost && offer.offer_type === 'offer' || offer.offer_type === 'coupon'){
            //console.log('should be here')
            if(offer.actions.reward.reward_meta.reward_type === 'free') {
                var updated_data = checkFreeItem(data, offer);
                offer.is_applicable = updated_data.is_applicable;
                offer.order_value = updated_data.order_value;
                offer.free_item = updated_data.free_item;
                return offer;
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'bogo') {
                var updated_data = checkOfferTypeBogo(data, offer);

                offer.is_applicable = updated_data.is_applicable;
                offer.order_value = updated_data.order_value;
                    
                return offer;
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'discount') {
                var updated_data = checkOfferTypePercentageOff(data, offer);
                offer.is_applicable = updated_data.is_applicable;
                offer.order_value = updated_data.order_value;
                console.log(offer)    
                return offer;
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'flatoff') {
                var updated_data = checkOfferTypeFlatOff(data, offer);
                offer.is_applicable = updated_data.is_applicable;
                offer.order_value = updated_data.order_value;
                   
                return offer;
                
            }
            else {
                return offer;
            }
        }
        else{            
            console.log('offer type alag ahai ' + offer.actions.reward.reward_meta.reward_type)
            return offer;
        }
        
    })
    deferred.resolve(passed_data);
    return deferred.promise;
}

function checkFreeItem(data, offer) {
    logger.log();
    var deferred = Q.defer();

    console.log('checking offer type free '+offer.actions.reward.reward_meta.reward_type)
    var passed_data = data;
    var offer_id = offer._id;
    var items = passed_data.items;
    var offers = passed_data.outlet.offers;
    // if(offer.is_applied){

    // }
    // else {
    //     return offer
    // }
    for(var i = 0; i < items.length; i++) {
    
        if(offer.offer_items && offer.offer_items.category_id === items[i].category_id
            && offer.offer_items.sub_category_id === items[i].sub_category_id
            && offer.offer_items.item_id === items[i].item_id
            || offer.offer_items.option_id === items[i].option_id
            || (items[i].sub_option_id && offer.offer_items.sub_option_id) === (items[i].sub_option_id)
            || (items[i].addon_id && offer.offer_items.sub_option_id.add_ons) === items[i].addon_id){
            
            var order_value = calculate_order_value(passed_data, offer.offer_items.item_id)
                
            console.log('for free');
            console.log(order_value);
            console.log(offer.minimum_bill_value);
            if(order_value >= offer.minimum_bill_value) {
                console.log('offer applicable');
                
                    offer.is_applicable = true;
                    offer.order_value = order_value;
                    offer.free_item = items[i];
                    return offer;
                
            }
            else{
                offer.is_applicable = false;
                offer.order_value = order_value;                
                console.log('offer not applicable');
                return offer;
            }        
        }
        else{
            offer.is_applicable = false; 
            console.log('offer not applicable');
            return offer;
        }
    }   
    
}

function checkOfferTypeBogo(data, offer) {
    logger.log();
    var deferred = Q.defer();
    
    console.log('checking offer type bogo')
    var passed_data = data;
    var offer_id = offer._id;
    var items = passed_data.items;

    for(var i = 0; i < items.length; i++) {
        if(offer.offer_items.category_id === items[i].category_id
            && offer.offer_items.sub_category_id === items[i].sub_category_id
            && offer.offer_items.item_id === items[i].item_id
            || offer.offer_items.option_id === items[i].option_id
            || (items[i].sub_option_id && offer.offer_items.sub_option_id) === (items[i].sub_option_id)
            || (items[i].addon_id && offer.offer_items.sub_option_id.add_ons) === items[i].addon_id){
            
            var order_value = calculate_order_value(passed_data, offer.offer_items.item_id)
            console.log('for free');
            console.log(order_value);
            console.log(offer.minimum_bill_value);
            if(order_value >= offer.minimum_bill_value) {
                console.log('offer applicable');
                
                    offer.is_applicable = true;
                    offer.order_value = order_value;
                
            }
            else{
                offer.is_applicable = false;
                offer.order_value = order_value;
                
                console.log('offer not applicable');
            }
            
            return offer;
                    
        }
        else{
            var order_value = calculate_order_value(passed_data, null)
            offer.is_applicable = false;
            offer.order_value = order_value; 
            console.log('offer not applicable');
            console.log(offer)
            return offer;
        }
    }
}

function checkOfferTypeFlatOff(data, offer) {
    logger.log();
    var deferred = Q.defer();

    console.log('checking offer type flatoff')
    var passed_data = data;
    var id = offer._id;

    var order_value = calculate_order_value(passed_data, null)
                
    console.log('for flat off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value >= offer.minimum_bill_value) {
        console.log('offer applicable');

        order_value = order_value - offer.actions.reward.reward_meta.off;        
        offer.is_applicable = true;
        offer.order_value = order_value;
    
    }
    else{
        offer.is_applicable = false;
        offer.order_value = order_value;
        
        console.log('offer not applicable');
    }
    return offer;
}

function checkOfferTypePercentageOff(data, offer) {
    logger.log();
    var deferred = Q.defer();

    console.log('checking offer type percentage off')
    var passed_data = data;
    var id = offer._id;

    var order_value = calculate_order_value(passed_data, null)
                
    console.log('for percentage off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value >= offer.minimum_bill_value) {
        console.log('offer applicable');
        console.log(offer.actions.reward.reward_meta.percent)
        order_value = order_value - (order_value * offer.actions.reward.reward_meta.percent)/100;
        offer.is_applicable = true;
        offer.order_value = order_value;
        
    }
    else{
        offer.is_applicable = false;
        offer.order_value = order_value;
        
        console.log('offer not applicable');
    }
    return offer;
}


