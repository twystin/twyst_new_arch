'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var geolib = require('geolib');
var moment = require('moment');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var Order = mongoose.model('Order');
var User = mongoose.model('User');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var OutletHelper = require('./outlet.hlpr');
var RecoHelper = require('./reco.hlpr');
var keygen = require('keygenerator');
var Bayeux = require('../../app_server');
var PaymentHelper = require('./payment.hlpr');
var TaxConfig = require('../../config/taxes.cfg');
var Transporter = require('../../transports/transporter.js');
var Handlebars = require('handlebars');
var fs = require('fs');


module.exports.verify_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();

    var data = {};
    data.items = order.items;
    data.outlet = order.outlet;
    data.coords = order.coords;
    data.user_token = token;
    console.log(data.items);

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
        return set_valid_delivery_zone(data);
    })
    .then(function(data){
        return check_minimum_bill_amount(data);
    }) 
    .then(function(data){
        return check_item_availability(data);
    })  
    .then(function(data){
        return get_applicable_offer(data);
    })
    .then(function(data){
        return massage_offer(data);
    })
    .then(function(data){
        return generate_and_cache_order(data);
    })
    .then(function(data) {
        var updated_data = {};

        updated_data.order_number = data.order.order_number;
        updated_data.order_actual_value_without_tax = data.order.order_actual_value_without_tax;
        updated_data.vat = data.order.vat;
        updated_data.st = data.order.st;
        updated_data.packaging_charge = data.order.packaging_charge;
        updated_data.delivery_charge = data.order.delivery_charge;
        updated_data.order_actual_value_with_tax = data.order.order_actual_value_with_tax;
        updated_data.offers = [];
        _.each(data.order.available_offers, function(offer){
           updated_data.offers.push(offer); 
        })
        
        deferred.resolve(updated_data);
    })
    .fail(function(err) {
        console.log(err)
      deferred.reject(err);
    });

    return deferred.promise;
}

module.exports.apply_offer = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    console.log(order);
    var data = {};
    data.outlet = order.outlet;
    data.user_token = token;
    data.offer_used = order.offer_id;
    data.order_number = order.order_number;

    get_user(data)
    .then(function(data){
        return get_outlet(data);
    })
    .then(function(data){
        return check_offer_applicability(data);
    })
    .then(function(data){
        return apply_selected_offer(data);
    })
    .then(function(data) {
        var updated_data = {};
        updated_data.order_number = data.order_number;
        updated_data.items = data.items;
        updated_data.order_actual_value_without_tax = data.order_actual_value_without_tax;
        updated_data.vat = data.vat;
        updated_data.st = data.st;
        updated_data.order_actual_value_with_tax = data.order_actual_value_with_tax;
        updated_data.offer_used = data.offer_used || null;
       
        deferred.resolve(updated_data);
    })
    .fail(function(err) {
        console.log(err)
      deferred.reject(err);
    });
    
    return deferred.promise;
}

module.exports.checkout = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    console.log(order);
    var data = {};
    data.user_token = token;
    data.outlet = order.outlet;
    data.order_number = order.order_number;
    data.address = order.address;
    
    get_user(data)
    .then(function(data) {
        return get_outlet(data);
    })
    .then(function(data) {
        return massage_order(data);
    })
    .then(function(data) {
        return calculate_cashback(data);
    })
    .then(function(data) {
        return remove_order_from_cache(data);
    })
    .then(function(data) {
        return save_user_address(data);
    })
    .then(function(data) {        
        deferred.resolve(data.order);
    })
    .fail(function(err) {
        console.log(err)
      deferred.reject(err);
    });
    
    return deferred.promise;
}

function basic_checks(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;

    if(!passed_data.outlet){
        deferred.reject({message: 'could not process without outlet'});
    }
    
    if(!passed_data.items || !passed_data.items.length){
        deferred.reject({
            
            message: 'no item passed'
        });
    }
    if(!passed_data.coords || !passed_data.coords.lat || !passed_data.coords.long){
        deferred.reject({
            
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
          message: "outlet is not active"
        });
    }
    else if(isOutletClosed(outlet)){
        deferred.reject({
          message: "outlet is currently closed"
        });
    }
    else if (!isDeliveryOutlet(outlet)) {
        deferred.reject({
          message: "outlet does not deliver"
        });
    }
    else if (!isMenuActive(outlet)) {
        deferred.reject({
          message: "menu is not active"
        });
    }
    else if (!verify_delivery_location(data.coords, outlet)){
        deferred.reject({
          message: "outlet does not deliver at selected location"
        });
    }
    else{
        deferred.resolve(passed_data);
    }

    return deferred.promise;
}

function set_valid_delivery_zone(data) {
    logger.log();
    var deferred = Q.defer();

    if(data.outlet.attributes.delivery.delivery_zone && data.outlet.attributes.delivery.delivery_zone.length) {        
        
        var delivery_zone = _.map(data.outlet.attributes.delivery.delivery_zone, function(current_zone) {          
          if(current_zone.coord && current_zone.coord.length &&
            geolib.isPointInside({latitude: data.coords.lat, longitude: data.coords.long},
            current_zone.coord)){
            return current_zone;
          }
        })

        delivery_zone = _.compact(delivery_zone);
        delivery_zone =  _.max(delivery_zone, function(zone){ return zone.zone_type});
        if(delivery_zone) {
          data.outlet.valid_zone = delivery_zone;          
          deferred.resolve(data);
        }
        else{
            console.log('no delivery zone set up for outlet');
            deferred.reject({
                err: true, 
                message: 'outlet does not deliver in this deliver zone'
            })
        }
    
    }
    else{
        console.log('no delivery zone set up for outlet');
        deferred.reject({
            err: true, 
            message: 'no delivery zone set up for outlet'
        })
        
    }
    return deferred.promise;

}

function calculate_order_value(data, free_item, free_item_option) {
    logger.log();
    console.log('free_item ' + free_item);
    
    var items = data.items
    var menu = {};
    menu = data.outlet && data.outlet.menus[0];
    var items = data.items;
    var  amount = 0;
    
    for(var i = 0; i < items.length; i++) {
        var sub_options = [], addons = [], category, sub_category, item, option, menu_sub_options, order_sub_options, menu_addons,order_addons;
        category = _.findWhere(menu.menu_categories, {_id: items[i].category_id});
        var sub_category = _.findWhere(category && category.sub_categories, {_id: items[i].sub_category_id});
        
        item = _.findWhere(sub_category && sub_category.items, {_id: items[i].item_id});
        items[i].item_details = item;
        
        if(item && item.options && items[i].option_id) {
            option = _.findWhere(item.options, {_id: items[i].option_id});
            items[i].option = option;
        }
        else{
            option = null;
            items[i].option = null;
        }
        
        if(option && option.sub_options && items[i].sub_option_set_ids) {
            menu_sub_options = option.sub_options;
            order_sub_options = items[i].sub_option_set_ids;
            _.each(menu_sub_options, function(sub_option){
                _.each(order_sub_options, function(order_sub_option){
                    var selected_sub_option = _.findWhere(sub_option.sub_option_set, {_id: order_sub_option})
                    if(selected_sub_option){
                        sub_options.push(selected_sub_option);
                    }
                })
            })
        }
        
        if(option && option.addons && items[i].addon_set_ids) {
            menu_addons = option.addons;
            order_addons = items[i].addon_set_ids;
            _.each(menu_addons, function(addon){
                _.each(order_addons, function(order_addon){
                    var selected_addon = _.findWhere(addon.addon_set, {_id: order_addon})
                    if(selected_addon){
                        addons.push(selected_addon);
                    }
                })
            })
        }
        
        if(item && item._id === free_item && option && option._id === free_item_option) {
            amount = amount+(option.option_cost*(items[i].quantity-1));
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + (sub_option.sub_option_cost*(items[i].quantity-1));
                })               
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + (addons.addon_cost*(items[i].quantity-1));
                })
            }
        }
        else if(item && item._id === free_item && !option) {
            amount = amount+(item.item_cost*(items[i].quantity-1));           
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + (sub_option.sub_option_cost*(items[i].quantity-1));
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + (addons.addon_cost*(items[i].quantity-1));
                })
            }
        }         
        else if(option && (item.option_price_is_additive || item.option_is_addon)){
            console.log('in prices are additive option');
            amount = amount+(item.item_cost*items[i].quantity);
            amount = amount+(option.option_cost*items[i].quantity);
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + (sub_option.sub_option_cost*items[i].quantity);
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + (addon.addon_cost*items[i].quantity);
                })
            }    
            
        }
        else if(option){
            amount = amount+(option.option_cost*items[i].quantity);
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + (sub_option.sub_option_cost*items[i].quantity);
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + (addon.addon_cost*items[i].quantity);
                })
            }                  
        }
        else{
            console.log('without option');
            console.log(item.item_cost);
            amount = amount+(item.item_cost*items[i].quantity);
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + (sub_option.sub_option_cost*items[i].quantity);
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + (addon.addon_cost*items[i].quantity);
                })
            }   
        }
    }

    console.log('order amount in calculate_order_value '+ amount);
    return Math.round(amount);
}

function verify_delivery_location(coords, outlet) {
    //check whether outlet delivers in selected location
    logger.log();

    if(outlet.attributes.delivery.delivery_zone && outlet.attributes.delivery.delivery_zone.length) {        
        
        var delivery_zone = _.map(outlet.attributes.delivery.delivery_zone, function(current_zone) {          
          if(current_zone.coord && current_zone.coord.length &&
            geolib.isPointInside({latitude: coords.lat, longitude: coords.long},
            current_zone.coord)){            
            return current_zone;
          }
        })

        delivery_zone = _.compact(delivery_zone);
    
        if(delivery_zone && delivery_zone.length) {
          return true;
        }
        else{
          return false;
        }    
    }
    else{
        return false; 
    }
}

//check outlet open
function isOutletClosed(outlet) {
    logger.log();
    var date = new Date();
    var time = date.getHours()+5 +':'+date.getMinutes()+30;
    date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();
    console.log(time);
    if (outlet && outlet.business_hours ) {
      if(RecoHelper.isClosed(date, time, outlet.business_hours)) {
          return true;
      }
      else{
        return false;
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
    var time = moment().hours()+5 +':'+moment().minutes()+30;
    date = parseInt(date.getMonth())+1+ '-'+ date.getDate()+'-'+date.getFullYear();
    var i, offer_cost = 0;

    passed_data.outlet.offers = _.map(data.outlet.offers, function(offer) {
        offer_cost = offer.offer_cost || 0;
        if(offer.offer_status === 'active' && new Date(offer.offer_end_date) > new Date()
        && !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours))
        && data.user.twyst_bucks >= offer_cost && offer.actions.reward.applicability.delivery
        && offer.offer_type === 'offer' 
        || offer.offer_type === 'coupon'){
            if(offer.actions.reward.reward_meta.reward_type === 'free') {
                return checkFreeItem(data, offer);
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'buyxgety') {
                return checkOfferTypeBuyXgetY(data, offer);  
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'discount') {
                return checkOfferTypePercentageOff(data, offer);
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'flatoff') {
                return checkOfferTypeFlatOff(data, offer);
                
            }
            else {
                return null;
            }
        }
        else{            
            console.log('offer type alag ahai ' + offer.actions.reward.reward_meta.reward_type)
            return null;
        }        
    })
    deferred.resolve(passed_data);
    return deferred.promise;
}

function checkFreeItem(data, offer) {
    logger.log();
    var deferred = Q.defer();

    console.log('checking offer type free ')
    var passed_data = data;
    var offer_id = offer._id;
    var items = passed_data.items;
    var offers = passed_data.outlet.offers;

    for(var i = 0; i < items.length; i++) {

        if(searchItemInOfferItems(items[i], offer)){
            var order_value = calculate_order_value(passed_data, items[i].item_id, items[i].option);
            
            if(order_value >= offer.minimum_bill_value) {
                console.log('offer applicable');
                var order_value_obj = calculate_tax(order_value, passed_data.outlet);
                if(order_value_obj.order_value_with_tax >= data.outlet.valid_zone.min_amt_for_delivery){
                    offer.is_applicable = true;
                    offer.order_value_without_tax = Math.round(order_value_obj.order_value);
                    offer.vat = order_value_obj.vat;
                    offer.st = order_value_obj.st;
                    offer.packaging_charge = order_value_obj.packaging_charge;
                    offer.delivery_charge = order_value_obj.delivery_charge;
                    offer.order_value_with_tax = Math.round(order_value_obj.new_order_value);
                    offer.free_item_index = i;
                    return offer; 
                }
                else{
                    offer.is_applicable = false;
                    return offer;   
                }                                
            }
            else{
                var order_value_obj = calculate_tax(calculate_order_value(passed_data, null, null), passed_data.outlet);
                offer.is_applicable = false;                
                return offer;
            }          
        }
        else if(i === items.length-1){
            var order_value_obj = calculate_tax(calculate_order_value(passed_data, null, null), passed_data.outlet);
            offer.is_applicable = false;
            console.log('offer not applicable');
            return offer;
        }
    }      
}

function checkOfferTypeBuyXgetY(data, offer) {
    logger.log();
    var deferred = Q.defer();
    
    console.log('checking offer type bogo');
    var passed_data = data;
    var offer_id = offer._id;
    var items = passed_data.items;
    var is_contain_free_item = false;
    var is_contain_paid_item = false;

    for(var i = 0; i < items.length; i++) {
        if(searchItemInPaidItems(items[i], offer)){
            is_contain_paid_item = true;
            break;
        }
    }
    console.log('is_contain_paid_item ' + is_contain_paid_item);
    for(var i = 0; i < items.length; i++) {
        
        if(searchItemInOfferItems(items[i], offer) && is_contain_paid_item){
            var order_value = calculate_order_value(passed_data, items[i].item_id, items[i].option);
            console.log(order_value);
            console.log(offer.minimum_bill_value);
            if(order_value >= offer.minimum_bill_value) {
                console.log('offer applicable');
                var order_value_obj = calculate_tax(order_value, passed_data.outlet);
                if(order_value_obj.order_value_with_tax >= data.outlet.valid_zone.min_amt_for_delivery){
                    offer.is_applicable = true;
                    offer.order_value_without_tax = Math.round(order_value_obj.order_value);
                    offer.vat = order_value_obj.vat;
                    offer.st = order_value_obj.st;
                    offer.packaging_charge = order_value_obj.packaging_charge;
                    offer.delivery_charge = order_value_obj.delivery_charge;
                    offer.order_value_with_tax = Math.round(order_value_obj.new_order_value);
                    offer.free_item_index = i;
                    return offer;     
                }
                else{
                    offer.is_applicable = false;
                    return offer;
                }                           
            }
            else{
                var order_value_obj = calculate_tax(calculate_order_value(passed_data, null, null), passed_data.outlet);
                offer.is_applicable = false;                
                console.log('offer not applicable');
                return offer;
            }          
        }
        else if(i === items.length-1){
            var order_value_obj = calculate_tax(calculate_order_value(passed_data, null, null), passed_data.outlet);
            offer.is_applicable = false;
            console.log('offer not applicable');
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

    var order_value = calculate_order_value(passed_data, null, null);
                
    console.log('for flat off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value >= offer.minimum_bill_value) {
        console.log('offer applicable');

        order_value = order_value - offer.actions.reward.reward_meta.off;
        var order_value_obj = calculate_tax(order_value, passed_data.outlet);
        if(order_value_obj.order_value_with_tax >= data.outlet.valid_zone.min_amt_for_delivery){
            offer.is_applicable = true;
            offer.order_value_without_tax = Math.round(order_value_obj.order_value);
            offer.vat = order_value_obj.vat;
            offer.st = order_value_obj.st;
            offer.packaging_charge = order_value_obj.packaging_charge;
            offer.delivery_charge = order_value_obj.delivery_charge;
            offer.order_value_with_tax = Math.round(order_value_obj.new_order_value);
            return offer;     
        }
        else{
            offer.is_applicable = false;
            return offer;
        }
                   
    }
    else{
        offer.is_applicable = false;
        console.log('offer not applicable');
        return offer;
    }
    
}

function checkOfferTypePercentageOff(data, offer) {
    logger.log();
    var deferred = Q.defer();

    console.log('checking offer type percentage off')
    var passed_data = data;
    var id = offer._id;
    var discount = 0;

    var order_value = calculate_order_value(passed_data, null, null);
                
    console.log('for percentage off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value >= offer.minimum_bill_value) {
        discount = (order_value * offer.actions.reward.reward_meta.percent)/100;
        if(discount <= offer.actions.reward.reward_meta.max) {
            order_value = order_value - discount;            
        }
        else {
            order_value = order_value - offer.actions.reward.reward_meta.max;               
        }
        var order_value_obj = calculate_tax(order_value, passed_data.outlet);
        if(order_value_obj.order_value_with_tax >= data.outlet.valid_zone.min_amt_for_delivery){
            console.log('offer applicable');
            offer.is_applicable = true;
            offer.order_value_without_tax = Math.round(order_value_obj.order_value);
            offer.vat = order_value_obj.vat;
            offer.st = order_value_obj.st;
            offer.packaging_charge = order_value_obj.packaging_charge;
            offer.delivery_charge = order_value_obj.delivery_charge;
            offer.order_value_with_tax = Math.round(order_value_obj.new_order_value);
            return offer;     
        }
        else{
            offer.is_applicable = false;
            return offer;
        }
                   
    }
    else{
        offer.is_applicable = false;
        return offer;    
    }
    
}

function check_minimum_bill_amount(data) {
    logger.log();
    var deferred = Q.defer();

    var order_actual_value_obj = calculate_tax(calculate_order_value(data, null, null), data.outlet);
    if(order_actual_value_obj.order_value_with_tax >= data.outlet.valid_zone.min_amt_for_delivery) {
        deferred.resolve(data);    
    }
    else{
        deferred.reject({
            err: null,
            message: 'minimum amount for delivery at selected location is ' + data.outlet.valid_zone.min_amt_for_delivery
        });
    }

    return deferred.promise;
}

function generate_and_cache_order(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;
    var order_number, order_actual_value_obj = {};
    var date = new Date();
    var month = date.getMonth()+1;
    var year = date.getFullYear();
    year = year.toString().substr(2,2);

    var code = keygen._({
        forceUppercase: true,
        length: 4,
        exclude: ['O', '0', '1', 'I']
    });
    var order = {};
    order_number = 'TW'+data.outlet.links.short_url+month+year+code;
    order_actual_value_obj = calculate_tax(calculate_order_value(passed_data, null, null), passed_data.outlet);

    order.user = data.user._id;
    order.outlet = data.outlet._id;
    order.order_number = order_number;
    order.items = data.items;
    order.order_actual_value_without_tax = order_actual_value_obj.order_value;     
    order.vat = order_actual_value_obj.vat;     
    order.st = order_actual_value_obj.st;     
    order.packaging_charge = order_actual_value_obj.packaging_charge;     
    order.delivery_charge = order_actual_value_obj.delivery_charge;
    order.order_actual_value_with_tax = order_actual_value_obj.new_order_value;     
    order.available_offers = data.outlet.offers;
    order.estimeted_delivery_time = passed_data.outlet.valid_zone.delivery_estimated_time;
    order.delivery_zone = passed_data.outlet.valid_zone.zone_name;
    order.menu_id = data.outlet.menus[0]._id;
    data.order = order;
    
    Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
      if(err) {
        logger.log(err);
      }
        deferred.resolve(data);
    });
    return deferred.promise;

}

function check_offer_applicability(data) {
    logger.log();
    var deferred = Q.defer();

    if(data.offer_used) {
        var offer = _.find(data.outlet.offers, function(offer) {
            if(offer._id === data.offer_used) {
                var date = new Date();
                var time = moment().hours()+5 +':'+moment().minutes()+30;
                date = date.getMonth()+1+'-'+date.getDate()+'-'+date.getFullYear();

                if(!(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours))) {
                    return offer;
                }       
            }
        })
        if(offer) {
            deferred.resolve(data);
        }
        else{
            deferred.reject('offer is not available right now');
        }    
    }
    else{
        deferred.resolve(data);
    }    
    
    return deferred.promise;
}
function apply_selected_offer(data) {
    logger.log();
    var deferred = Q.defer();

    var offer_used = {};
    Cache.hget(data.user._id, 'order_map', function(err, reply) {
        if(!reply) {
            deferred.reject('no offer available for user at this outlet')
        }
        else{
            var order = JSON.parse(reply);
            if(data.order_number.toString() === order.order_number.toString()) {
                data.order_actual_value_without_tax = order.order_actual_value_without_tax;
                data.vat = order.vat;
                data.st = order.st;
                data.order_actual_value_with_tax = order.order_actual_value_with_tax;
                if(data.offer_used) {                                    
                    offer_used = _.find(order.available_offers, function(offer){
                        
                        if(offer && offer.is_applicable && offer._id === data.offer_used) {                           
                            order.offer_used = offer;                            
                            return offer;                        
                        }
                    })
                    
                    if(offer_used) {
                        Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
                           if(err) {
                             logger.log(err);
                           }
                           else{
                                console.log('order found and offer applied');
                                data.offer_used = offer_used;                                
                                deferred.resolve(data);
                            }
                            
                        });     
                    }
                    else{                                                
                        order.offer_used = null;
                        Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
                           if(err) {
                             logger.log(err);
                           }
                           else{
                                console.log('order found no offer applied');
                                data.offer_used = offer_used;
                                deferred.resolve(data);
                           }
                            
                        }); 
                    }
                      
                }
                else{
                    console.log('order found and no offer applied');                    
                    data.offer_used = null;
                    deferred.resolve(data);
                }
            }
            else {                
                deferred.reject('order not found');
            }
        } 
    })
    return deferred.promise;
}

function calculate_tax(order_value, outlet) {
    logger.log();
    
    var tax_grid = {};
    var order_value_obj = {};
    order_value_obj.order_value = 0;
    order_value_obj.new_order_value = 0;
    order_value_obj.vat = 0;
    order_value_obj.st = 0;
    var new_order_value = 0, vat = 0, surcharge_on_vat = 0, st = 0, sbc = 0,packaging_charge = 0, delivery_charge = 0;

    tax_grid = _.find(TaxConfig.tax_grid, function(tax_grid) {        
        if(tax_grid.city.trim() === outlet.contact.location.city.trim()) {
            return tax_grid;
        }
    })

    if(outlet.menus[0].menu_item_type === 'type_1') {
        console.log(outlet.menus[0].menu_item_type);               
        vat = order_value*tax_grid.vat/100;
        surcharge_on_vat = vat*tax_grid.surcharge_on_vat/100;        
        
        sbc = order_value*tax_grid.st_applied_on_percentage/100*tax_grid.sbc/100;     
    }

    if(outlet.menus[0].charge_service_tax) {        
        st = order_value*tax_grid.st_applied_on_percentage/100*tax_grid.st/100;
    }
        
    if(outlet.attributes.has_packaging_charge && 
        outlet.attributes.packaging_charge.is_fixed) {
        packaging_charge = outlet.attributes.packaging_charge.value || 0;
    }

    if(outlet.valid_zone.delivery_charge) {
        delivery_charge = outlet.valid_zone.delivery_charge || 0;
    }
    console.log(vat + ' ' + surcharge_on_vat + ' ' + st + ' ' + sbc + ' ' + packaging_charge + ' ' + delivery_charge);
    new_order_value = order_value+vat+surcharge_on_vat+st+sbc+packaging_charge+delivery_charge;
    
    order_value_obj.vat = vat+surcharge_on_vat;
    order_value_obj.st = st+sbc;
    order_value_obj.packaging_charge = packaging_charge;
    order_value_obj.delivery_charge = delivery_charge;
    order_value_obj.new_order_value = new_order_value;
    order_value_obj.order_value = order_value;
    order_value_obj.order_value_with_tax = order_value+vat+surcharge_on_vat+st+sbc;

    return order_value_obj;
}

function massage_offer(data) {
    logger.log();
    var deferred = Q.defer();
    data.outlet.offers = _.compact(data.outlet.offers);

    data.outlet.offers = _.map(data.outlet.offers, function(offer) {
      if(offer && offer.offer_status === 'archived' || offer.offer_status === 'draft') {
        return false;
      }
      else if(offer){
        var massaged_offer = {};
        massaged_offer.order_value_without_tax = offer.order_value_without_tax;
        massaged_offer.vat = offer.vat;
        massaged_offer.st = offer.st;
        massaged_offer.packaging_charge = offer.packaging_charge;
        massaged_offer.delivery_charge = offer.delivery_charge;
        massaged_offer.order_value_with_tax = offer.order_value_with_tax;
        massaged_offer.is_applicable = offer.is_applicable;
        massaged_offer._id = offer._id;
        massaged_offer.header = offer.actions && offer.actions.reward && offer.actions.reward.header || offer.header;
        massaged_offer.line1 = offer.actions && offer.actions.reward && offer.actions.reward.line1 || offer.line1;
        massaged_offer.line2 = offer.actions && offer.actions.reward && offer.actions.reward.line2 || offer.line2;
        massaged_offer.description = offer.actions && offer.actions.reward && offer.actions.reward.description || '';
        massaged_offer.terms = offer.actions && offer.actions.reward && offer.actions.reward.terms || '';

        massaged_offer.type = offer.offer_type;
        massaged_offer.meta = offer.actions && offer.actions.reward && offer.actions.reward.reward_meta || offer.meta;

        massaged_offer.expiry = offer.offer_end_date || offer.expiry_date;

        if(offer.offer_items) {
            massaged_offer.offer_items = offer.offer_items;
        }
        var date = new Date();
        var time = moment().hours() +':'+moment().minutes();
        date = date.getMonth()+1+'-'+date.getDate()+'-'+date.getFullYear();

        if (offer && offer.actions && offer.actions.reward && offer.actions.reward.reward_hours) {
          massaged_offer.available_now = !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours));
          if (!massaged_offer.available_now) {
            massaged_offer.available_next = RecoHelper.opensAt(offer.actions.reward.reward_hours) || null;
          }

        }
        if(offer.offer_type === 'offer' || offer.offer_type === 'deal' || offer.offer_type ==='bank_deal') {
          massaged_offer.offer_cost =  offer.offer_cost;  
        }
        if(offer.offer_type === 'bank_deal') {
          massaged_offer.offer_source = offer.offer_source;
        }

        if(offer.actions.reward.reward_meta.reward_type == 'free' || offer.actions.reward.reward_meta.reward_type == 'buyxgety' ) {
            massaged_offer.free_item_index = offer.free_item_index;
        }

        if(massaged_offer.expiry && (new Date(massaged_offer.expiry) <= new Date())) {
          return massaged_offer;
        }
        else{
            return massaged_offer;
        }
              
      }
      else{
        return false;
      }

    });
    deferred.resolve(data);
    return deferred.promise;
}

function massage_order(data){
    logger.log();
    var deferred = Q.defer();
    Cache.hget(data.user._id, 'order_map', function(err, reply) {
        if(!reply) {
            deferred.reject('can not process this order')
        }
        else{
            var order = JSON.parse(reply);
            var items = [];
            _.each(order.items, function(item){
                var massaged_item = {};
                massaged_item.category = item.category_id;
                massaged_item.sub_category = item.sub_category_id;
                massaged_item._id = item.item_details._id;                
                massaged_item.item_name = item.item_details.item_name;
                massaged_item.item_quantity = item.quantity;
                massaged_item.item_description = item.item_details.description;
                massaged_item.item_photo = item.item_details.item_photo;
                massaged_item.item_tags = item.item_details.item_tags;
                massaged_item.item_cost = item.item_details.item_cost;
                if(item.option) {
                    massaged_item.option = item.option;    
                    delete massaged_item.option.addons;
                    delete massaged_item.option.sub_options;
                    massaged_item.option.sub_options = item.sub_options;
                    massaged_item.option.addons = item.addons;
                }
                
                items.push(massaged_item);
            })

            if(data.order_number === order.order_number) {
                order.address = data.address;
                order.order_status = 'checkout';
                order.estimeted_delivery_time = order.estimeted_delivery_time;
                order.items = items;
                order.address.delivery_zone = order.delivery_zone;
                order.packaging_charge = order.packaging_charge;
                order.delivery_charge = order.delivery_charge;
                order.comments = order.comments;
                if(order.offer_used) {
                    order.order_value_without_offer = Math.round(order.order_actual_value_without_tax);
                    order.order_value_with_offer = Math.round(order.offer_used.order_value_without_tax);
                    order.tax_paid = order.offer_used.st+order.offer_used.vat;
                    order.actual_amount_paid = Math.round(order.offer_used.order_value_with_tax);

                }
                else {
                    order.offer_used = null;
                    order.order_value_without_offer = Math.round(order.order_actual_value_without_tax);
                    order.order_value_with_offer = null;
                    order.tax_paid = order.st+order.vat;
                    order.actual_amount_paid = Math.round(order.order_actual_value_with_tax);
                }
                var order_json = order
                order = new Order(order); 
    
                order.save(function(err, saved_order){
                    if(err){
                        console.log(err);
                        deferred.reject('unable to checkout');
                    }
                    else{
                        order_json._id = saved_order._id;
                        data.order = order_json;
                        console.log('saved');
                        deferred.resolve(data);   
                    }
                })                    
            }
            else{
                deferred.reject({
                    err: err || true,
                    message: 'could not process this order'
                });                                
            }
        }
    })
    return deferred.promise;
}


function calculate_cashback(data) {
    logger.log();
    var deferred = Q.defer();
    
    if(!data.order.offer_used && data.outlet.twyst_meta.cashback_info
        && data.outlet.twyst_meta.cashback_info.base_cashback) {
        console.log('cashback setup');
        var cod_cashback = 0, inapp_cashback = 0, order_amount_ratio = 1;

        if(data.outlet.twyst_meta.cashback_info.order_amount_slab.length) {
            order_amount_ratio = _.find(data.outlet.twyst_meta.cashback_info.order_amount_slab, function(slab){
                if(data.order.order_actual_value_without_tax > slab.start &&
                    data.order.order_actual_value_without_tax < slab.end) {
                    return slab.ratio;
                }
            });    
        }
        
        var inapp_ratio = data.outlet.twyst_meta.cashback_info.in_app_ratio;
        var cod_ratio = data.outlet.twyst_meta.cashback_info.cod_ratio;
        var base_cashback = data.outlet.twyst_meta.cashback_info.base_cashback;
        
        var order_amount_cashback = data.order.order_actual_value_without_tax*base_cashback * order_amount_ratio /100;
        cod_cashback = data.order.order_ctual_value_without_tax*base_cashback * cod_ratio /100;
        inapp_cashback = data.order.order_actual_value_without_tax*base_cashback * inapp_ratio /100;
        cod_cashback = _.max([base_cashback, order_amount_cashback, cod_cashback], function(cashback){ return cashback; });
        inapp_cashback = _.max([base_cashback, order_amount_cashback, inapp_cashback], function(cashback){ return cashback; });
        data.order.cod_cashback = Math.round(cod_cashback);
        data.order.inapp_cashback = Math.round(inapp_cashback);
        data.order.cod_cashback_percenatage = _.max([base_cashback*cod_ratio, base_cashback*order_amount_ratio], function(cashback){ return cashback; });
        data.order.inapp_cashback_percenatage = _.max([base_cashback*inapp_ratio, base_cashback*order_amount_ratio], function(cashback){ return cashback; });
        data.order.cod_cashback_percenatage = data.order.cod_cashback_percenatage.toFixed(2);
        data.order.inapp_cashback_percenatage = data.order.inapp_cashback_percenatage.toFixed(2);
        
    }
    else{
        console.log('cashback not setup');
        data.order.cod_cashback = 0;
        data.order.inapp_cashback = 0;   
        
    }
    deferred.resolve(data);
    return deferred.promise;
}

function remove_order_from_cache(data) {
    logger.log();
    var deferred = Q.defer();

    Cache.hset(data.user._id, "order_map", '', function(err) {
       if(err) {
         logger.log(err);
       }
       else{
         deferred.resolve(data);   
        }
    });
    
    return deferred.promise;
}

function save_user_address(data) {
    logger.log();
    var deferred = Q.defer();

    var address = data.order.address;
    User.findOneAndUpdate({_id: data.user._id},
        {$push: {address: address}}
    ).exec(function(err, user) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        } else {   
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

function searchItemInPaidItems(item, offer) {
    logger.log();
    
    var category_id = _.findIndex(offer.actions.reward.reward_meta.paid_item.categories, function(current_category) {
        return current_category.toString() == item.category_id;
    });
    
    var sub_category_id = _.findIndex(offer.actions.reward.reward_meta.paid_item.sub_categories, function(sub_category_id) {
        return sub_category_id.toString() == item.sub_category_id;
    });

    var item_id = _.findIndex(offer.actions.reward.reward_meta.paid_item.items, function(item_id) {
        return item_id.toString() == item.item_id;
    });
   
    var option_id = _.findIndex(offer.actions.reward.reward_meta.paid_item.options, function(option_id) {
        return option_id.toString() == item.option_id;
    });

    var sub_options = _.intersection(offer.actions.reward.reward_meta.paid_item.sub_options, item.sub_options);
   
    var addons = _.intersection(offer.actions.reward.reward_meta.paid_item.addons, item.addons);
    
    if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && !item.option && !item.addons.length && !item.sub_options.length){       
        return true; 
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && !item.addons.length && !item.sub_options.length){
        return true; 
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && item.addons && addons && addons.length
     && !item.sub_options.length){
        return true;   
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && item.sub_options && sub_options && sub_options.length
     && !item.addons.length){
        return true;   
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && item.sub_options && sub_options && sub_options.length
     && item.addons && addons && addons.length){
        return true;
    } 
    else {
        return false;
    }
}

function searchItemInOfferItems(item, offer) {
    logger.log();

    var category_id = _.findIndex(offer.offer_items.categories, function(current_category) {
        return current_category.toString() == item.category_id;
    });
    
    var sub_category_id = _.findIndex(offer.offer_items.sub_categories, function(sub_category_id) {
        return sub_category_id.toString() == item.sub_category_id;
    });

    var item_id = _.findIndex(offer.offer_items.items, function(item_id) {
        return item_id.toString() == item.item_id;
    });
   
    var option_id = _.findIndex(offer.offer_items.options, function(option_id) {
        return option_id.toString() == item.option_id;
    });

    var sub_options = _.intersection(offer.offer_items.sub_options, item.sub_options);
   
    
    var addons = _.intersection(offer.offer_items.addons, item.addons);

    if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && !item.options && !item.addons.length && !item.sub_options.length){       
        return true; 
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && !item.addons.length && !item.sub_options.length){
        return true; 
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && item.addons && addons && addons.length
     && !item.sub_options.length){
        return true;   
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && item.sub_options && sub_options && sub_options.length
     && !item.addons.length){
        return true;   
    }
    else if(category_id !== -1 && sub_category_id !==1 && item_id
     !== -1 && option_id !== -1 && item.sub_options && sub_options && sub_options.length
     && item.addons && addons && addons.length){
        return true;
    } 
    else {
        return false;
    }       
    
}

module.exports.get_order = function(token, order_id) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
      
        Order.findOne({ _id: order_id}, function(err, order) {
            if (err || !order) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t find the order'
              });
            } else {

              deferred.resolve({
                data: order,
                message: 'order found'
              });
            }
          }
        );
    }, function(err) {
        deferred.reject({
          err: err || true,
          message: 'Couldn\'t find the user'
        });
    });

  return deferred.promise;
};

module.exports.get_orders = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        if (data.data.role === 1) {
            Order.find({}).populate('outlet user').exec(function(err, orders) {
                if (err || !orders) {
                    deferred.reject({
                        err: err || false,
                        message: 'Unable to load orders'
                    });
                } else {
                    process_orders(orders, deferred);
                }
            });
        } else if (data.data.role >= 2 && data.data.role < 6) {
            Order.find({
                outlet: {
                    $in: data.data.outlets
                }
            }).populate('outlet user').exec(function(err, orders) {
                if (err || !orders) {
                    deferred.reject({
                        err: err || false,
                        message: 'Unable to load orders'
                    });
                } else {
                    process_orders(orders, deferred);
                }
            });
        } else {
            Order.find({user: data.data._id }).populate('outlet user').exec(function(err, orders) {
                if (err || !orders) {
                    deferred.reject({
                        err: err || false,
                        message: 'Unable to load orders'
                    });
                } else {
                    process_orders(orders, deferred);
                }
            });
        }
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });

    return deferred.promise;
}

module.exports.confirm_cod_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    
    var data = {};
    console.log(order)
    data.payment_mode = order.payment_mode;
    data.order_number = order.order_number;
    data.user_token = token;
    data.outlet = order.outlet;

    get_user(data)
    .then(function(data) {
        return get_outlet(data);
    })
    .then(function(data) {
        return update_payment_mode(data);
    })
    .then(function(data) {
        return send_sms(data);
    })
    .then(function(data) {
        return send_email(data);
    })
    .then(function(data) {
        return schedule_non_accepted_order_rejection(data);
    })
    .then(function(data) {
        return send_notification_to_all(data);
    })
    .then(function(data) {
        return schedule_order_status_check(data);
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


module.exports.confirm_inapp_order = function(data) {
    logger.log();
    var deferred = Q.defer();

    update_payment_mode(data)
    .then(function(data) {
        return send_sms(data);
    })
    .then(function(data) {
        return send_email(data);
    })
    .then(function(data) {
        return send_notification_to_all(data);
    })
    .then(function(data) {
        return schedule_order_status_check(data);
    })
    .then(function(data) {
        return schedule_non_accepted_order_rejection(data);
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

function process_orders(orders, deferred) {
    var processed_orders = _.map(orders, function(order){
        order = order.toJSON();
        var updated_order = {};    
        updated_order.outlet_name = order.outlet.basics.name;
        updated_order.background = 'https://s3-us-west-2.amazonaws.com/retwyst-merchants/retwyst-outlets/' + order.outlet._id + '/' + order.outlet.photos.background;
        updated_order.city = order.outlet.contact.location.city;
        updated_order.address = order.outlet.contact.location.address;
        updated_order.locality_1 = order.outlet.contact.location.locality_1[0];
        updated_order.locality_2 = order.outlet.contact.location.locality_2[0];
        updated_order.phone = order.outlet.contact.phones.mobile[0] && order.outlet.contact.phones.mobile[0].num;  
        updated_order.lat = order.outlet.contact.location.coords.latitude || null;
        updated_order.long = order.outlet.contact.location.coords.longitude || null;
        updated_order.delivery_zone = order.outlet.attributes.delivery.delivery_zone;
        if(order.outlet.twyst_meta.rating && order.outlet.twyst_meta.rating.value){
            updated_order.delivery_experience = order.outlet.twyst_meta.rating.value;    
        }
        else{
            updated_order.delivery_experience = null;
        }
        
        updated_order.order_number = order.order_number
        updated_order._id = order._id;
        updated_order.items = order.items;
        updated_order.outlet = order.outlet._id;
        updated_order.menu_id = order.menu_id;
        updated_order.address = order.address;
        updated_order.is_favourite = order.is_favourite;        
        updated_order.order_cost = order.actual_amount_paid;        
        updated_order.user = {
            _id: order.user && order.user._id,
            first_name: order.user && order.user.first_name,
            last_name: order.user && order.user.last_name,
            phone: order.user && order.user.phone,
            email: order.user && order.user.email
        }
        updated_order.order_value_without_offer = order.order_value_without_offer;
        updated_order.order_value_with_offer = order.order_value_with_offer;
        updated_order.packaging_charge = order.packaging_charge || 0;
        updated_order.delivery_charge = order.delivery_charge || 0;
        updated_order.tax_paid = order.tax_paid;
        updated_order.cashback = order.cashback;
        updated_order.order_date = order.order_date;
        updated_order.order_status = order.order_status;
        updated_order.actual_amount_paid = order.actual_amount_paid;
        updated_order.actions = order.actions;
        updated_order.estimeted_delivery_time = order.estimeted_delivery_time;
        updated_order.payment_info = order.payment_info;

        return updated_order;
    });
    deferred.resolve({
        data: processed_orders,
        message: 'found the orders'
    });
}

function update_payment_mode(data) {
    logger.log();
    var deferred = Q.defer();
    var is_inapp = false, card_id;
    if(data.payment_mode !== 'COD') {
        is_inapp = true;
    }

    if(data.payment_mode.charAt(0) === 'N' || data.payment_mode.charAt(0) === 'C' && data.payment_mode.length > 3) {
        data.payment_method = data.payment_mode;
        data.payment_mode = 'Zaakpay';
    };

    if(data.payment_mode.charAt(0) === 'C' && data.payment_mode.length > 3) {
        card_id = data.card_id;
    }

    Order.findOneAndUpdate({
        order_number: data.order_number
    }, {
        'order_status': 'PENDING',
        'payment_info.is_inapp': is_inapp,
        'payment_info.payment_mode': data.payment_mode,
        'payment_info.payment_method': data.payment_method,
        'payment_info.card_id': data.card_id
    }).exec(function(err, order) {
        if (err) {
            console.log(err);
            deferred.reject(err)
        } else {   
            data.order_id = order && order._id; 
            data.order = order;
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

function send_sms(data) {
    logger.log();
    var deferred = Q.defer();

    var payload  = {}
    payload.from = 'TWYSTR';
    payload.message = '';
    var items, collected_amount;
    var outlet_name = 'Outlet Name: ' + data.outlet.basics.name;
    if(data.user.profile && data.user.profile.first_name) {
        var name = ' Name: '+ data.user.profile.first_name;
    }
    else{
        var name = ' Name: '+ data.user.first_name;
    }
    
    var phone = ' Phone: '+ data.user.phone;
    var address_line1 = ' Address: '+data.order.address.line1;
    var address_line2 = data.order.address.line2;
    var address_line3 = ' Landmark: '+data.order.address.landmark;

    payload.message = outlet_name + name  + phone + address_line1 + ' Order Details: ';

    for (var i = 0; i < data.order.items.length; i++) {
        if (data.order.items[i].option && data.order.items[i].option.option_value) {
            items = data.order.items[i].item_quantity+' X ' +
            data.order.items[i].item_name+ ' ('+data.order.items[i].option.option_value + ') '+ ';';
            payload.message = payload.message+' '+ items;
        }
        else{
            items = data.order.items[i].item_quantity + ' X ' + data.order.items[i].item_name + ';';
            payload.message = payload.message+' '+ items;
        }
    
    };

    var order_number = ' Order Number: ' + data.order_number;    
    var placed_at =  ' Placed at: ' + (new Date(data.order.order_date)).getHours() + ':'+ (new Date(data.order.order_date)).getMinutes();
    var delivery_time = ' Delivery Time: '+ data.order.estimeted_delivery_time +' mins';
    
    var total_amount = ' Total Amount: Rs '+ data.order.actual_amount_paid ;
    if (data.payment_mode === 'COD') {
        collected_amount = ' Collect: Rs '+data.order.actual_amount_paid ;    
    }
    else{
        collected_amount = ', Paid in-app' ;    
    }

    payload.message = payload.message  +order_number+placed_at+delivery_time+total_amount+collected_amount;
    payload.message = payload.message.toString();
    console.log(payload.message);

    data.outlet.contact.phones.reg_mobile.forEach(function (phone) {
        if(phone && phone.num) {
            payload.phone = phone.num;
            Transporter.send('sms', 'vf', payload);
        }
    });
    //if(data.payment_mode === 'COD') {
        //payload.message = 'You order has been placed successfully at '+ data.outlet.basics.name+
                    //', Order Details ' + items + ', Total amount ' + data.order.actual_amount_paid +
                    //' , Payment Method: Cash on Delivery. '   
    //}
    //else{
       // payload.message = 'You order has been placed successfully at '+ data.outlet.basics.name+
                    ////', Order Details ' + items + ', Total amount ' + data.order.actual_amount_paid +
                    //' , Payment Method: in app payment. ' +   
    //}
    ////payload.phone = data.user.phone;
    //Transporter.send('sms', 'vf', payload);
    

    deferred.resolve(data);
    return deferred.promise;
}

function send_email(data) {
    logger.log();
    var deferred = Q.defer();

    var items ='', collected_amount,account_mgr_email, merchant_email;
    if(data.user.profile && data.user.profile.first_name) {
        var name = data.user.profile.first_name;
    }
    else{
        var name = data.user.first_name;
    }
    var phone = data.user.phone;
    var address_line1 = 'Address: '+data.order.address.line1;
    var address_line2 = data.order.address.line2;
    var address_line3 = 'Landmark: '+data.order.address.landmark;

   

    for (var i = 0; i < data.order.items.length; i++) {
        var item_price = getItemPrice(data.order.items[i]);
        var quantity = data.order.items[i].item_quantity;
        var final_cost = parseInt(item_price)*parseInt(quantity);
        
        if (data.order.items[i].option && data.order.items[i].option.option_value) {
            items = items + '\n'+ data.order.items[i].item_quantity+' X ' +
            data.order.items[i].item_name+ ' ('+data.order.items[i].option.option_value + ') '+' = ' + final_cost;
            
        }
        else{
            var quantity = data.order.items[i].item_quantity;
            var item_name = data.order.items[i].item_name;

            items = items + '\n' + quantity + ' X ' + item_name + ': Rs '+ final_cost;
            
        }
    
    };

    var order_number =  data.order_number;        
    var total_amount = data.order.actual_amount_paid ;
    if (data.payment_mode === 'COD') {
        collected_amount = data.order.actual_amount_paid ;    
    }
    else{
        collected_amount = 0 ;    
    }

    if(data.outlet.basics.account_mgr_email) {
        account_mgr_email = data.outlet.basics.account_mgr_email
    }
    else{
        account_mgr_email = 'kuldeep@twyst.in';
    }

    if(data.outlet.contact.emails.email) {
        merchant_email = data.outlet.contact.emails.email;
    }
    
    else{
        merchant_email = 'kuldeep@twyst.in'
    }
    var merchant_payload = {
        Destination: { 
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [ account_mgr_email] //, merchant_email
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data: 
                    "<h4>Outlet</h4>" + data.outlet.basics.name +
                    "<h4>Order Number</h4>" + data.order.order_number +
                    "<h4>Name</h4>" + name
                    + "<h4>Phone</h4>" + phone 
                    + "<h4>Address</h4>" + data.order.address.line1 
                    + "<h4>Items</h4>" + items
                    + "<h4>Total amount</h4>" + total_amount
                    + "<h4>Payment Method</h4>" + data.payment_mode
                    + "<h4>Amount to be Collected</h4>" + collected_amount
    
                },
                Text: {
                    Data: 'new order'
                    
                }
            },
            Subject: { /* required */
              Data: 'New Order ' + data.order.order_number, /* required */
              
            }
        },
        Source: 'info@twyst.in',
        ReturnPath: 'info@twyst.in' 
    };
    
    Transporter.send('email', 'ses', merchant_payload).then(function(reply) {
        console.log('main reply', reply);
        deferred.resolve(data);
    }, function(err) {
        console.log('mail failed', err);
        deferred.reject(data);
    });    
     
    return deferred.promise;   
}

function send_notification_to_all(data) {
    logger.log();
    var deferred = Q.defer();

    send_notification(['console', data.outlet.basics.account_mgr_email.replace('.', '').replace('@', ''),
        data.outlet._id], {
        message: 'you have a new order',
        order_id: data.order_id,
        type: 'new'
    });
    

    deferred.resolve(data); 
    return deferred.promise;       
}

function schedule_order_status_check(data) {
    logger.log();
    var deferred = Q.defer();

    var Agenda = require('agenda');
    var agenda = new Agenda({db: {address: 'localhost:27017/agenda'}});

    agenda.define('schedule_order_status_check', function(job, done) {
        Order.findOne({order_number: data.order_number}).exec(function(err, order) {
            if (err || !order){
                console.log(err);
            } 
            else {            
                if(order.order_status === 'PENDING') {
                    var payload = {};
                    payload.from = 'TWYSTR';
                    payload.message = 'Order has not been accepted yet at outlet  '+ data.outlet.basics.name + ' order number '+ data.order_number;
                    payload.phone = data.outlet.basics.account_mgr_phone;
                    Transporter.send('sms', 'vf', payload);

                    send_notification(['console', data.outlet.basics.account_mgr_email.replace('.', '').replace('@', '')], {
                        message: 'Order has not been accepted yet.',
                        order_id: data.order_id,
                        type: 'order_not_accepted'
                    });
                    
                }
                console.log(order.order_status);
            }
            done();
        })
    });

    agenda.on('ready', function() {
      agenda.schedule('in 5 minutes', 'schedule_order_status_check', {order_id: data.order_id});
      agenda.start();
    });
    
    deferred.resolve(data); 
    return deferred.promise;
}

function schedule_non_accepted_order_rejection(data) {

    logger.log();
    var deferred = Q.defer();

    var Agenda = require('agenda');
    var agenda = new Agenda({db: {address: 'localhost:27017/agenda'}});

    agenda.define('schedule_non_accepted_order_rejection', function(job, done) {
        Order.findOne({order_number: data.order_number}).exec(function(err, order) {
            if (err || !order){
                console.log(err);
            } 
            else if(order.order_status === 'PENDING'){  
                console.log('inside if');
                order.order_status = 'REJECTED';
                var current_action = {};
                current_action.action_type = 'REJECTED';
                current_action.action_by = '01234567890123456789abcd';
                current_action.message = 'order rejected by merchant.'
                order.actions.push(current_action);
                order.save(function(err, updated_order){
                    if(err || !updated_order){
                        console.log(err)
                        console.log(updated_order)
                        deferred.reject({
                            err: err || true,
                            message: 'Couldn\'t update this order'
                        });   
                    }
                    else{                                                    
                        var payload = {};
                        payload.from = 'TWYSTR';
                        payload.message = 'Order has been rejected by sytstem '+ data.outlet.basics.name + ' order number '+ data.order_number;
                        data.outlet.contact.phones.reg_mobile.forEach(function (phone) {
                            if(phone && phone.num) {
                                payload.phone = phone.num;
                                Transporter.send('sms', 'vf', payload);
                            }
                        });
                        
                        var path = ['console', data.outlet.basics.account_mgr_email.replace('.', '').replace('@', ''),data.outlet._id]

                        send_notification(['console', data.outlet.basics.account_mgr_email.replace('.', '').replace('@', ''),
                            data.outlet._id], {
                            message: 'order has been rejected by system.',
                            order_id: data.order_id,
                            type: 'cancelled'
                        }); 
                        
                        var date = new Date();
                        var time = date.getTime();
                        var notif = {};
                        notif.header = 'Order Rejected';
                        notif.message = 'Your order has been Rejected by merchant.';
                        notif.state = 'REJECTED';
                        notif.time = time;
                        notif.order_id = data.order_id;
                        send_notification_to_user(data.user.push_ids[data.user.push_ids.length-1].push_id, notif); 
                    }                    
                })
                console.log(order.order_status);
            }
            done();
        })
    });

    agenda.on('ready', function() {
      agenda.schedule('in 20 minutes', 'schedule_non_accepted_order_rejection', {order_id: data.order_id});
      agenda.start();
    });
    
    deferred.resolve(data); 
    return deferred.promise;
    
}

module.exports.update_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    console.log(token);
    console.log(order);
    AuthHelper.get_user(token).then(function(data){
        if(order.update_type === 'update_favourite')   {
            Order.findOne({_id: order.order_id}).exec(function(err, o) {
              if (err || !o) {
                console.log(err);
                deferred.reject({
                  err: err || true,
                  message: "Couldn\'t set as favourite order"
                });
              } else {
                o.is_favourite = order.is_favourite;
                o.save(function(err, updated_order){
                    if(err || !order) {
                        deferred.reject({
                            err: err || true,
                            message: 'Couldn\'t update this order'
                        });   
                    }
                    else{
                        deferred.resolve({
                            data: updated_order,
                            message: 'Updated as favourite order'
                        });    
                    }
                        
                })
                
              }
            });
        }
        else if(order.update_type === 'feedback') {
            Order.findOne({_id: order.order_id}, function(err, saved_order) {
                if (err || !saved_order) {
                  deferred.reject({
                    err: err || true,
                    message: 'Couldn\'t find this order'
                  });
                } else {
                    saved_order.feedback = {};
                    saved_order.feedback.is_ontime = order.is_ontime;
                    saved_order.feedback.rating = order.order_rating;
                    saved_order.order_status = 'CLOSED';

                    if(order.items_feedback) {
                        saved_order.items = order.items;    
                    }
                    
                    saved_order.save(function(err, update_order){
                        if(err || !update_order){
                            deferred.reject({
                                err: err || true,
                                message: 'Couldn\'t update this order'
                            });   
                        }
                        //add twyst bucks to user account
                        else{
                            Outlet.findOne({_id: order.outlet}, function(err, outlet) {
                                if (err || !saved_order) {
                                  deferred.reject({
                                    err: err || true,
                                    message: 'Couldn\'t process feedback'
                                  });
                                }
                                else{
                                    if(outlet.twyst_meta.rating && outlet.twyst_meta.rating.value) {
                                        var count = outlet.twyst_meta.rating.count+1;
                                        var rating = outlet.twyst_meta.rating.value;
                                        rating = (rating+order.order_rating)/count;
                                        outlet.twyst_meta.rating.value = rating;
                                        outlet.twyst_meta.rating.count = count;    
                                    }
                                    else{
                                        outlet.twyst_meta.rating.value = order.order_rating;
                                        outlet.twyst_meta.rating.count = 1;     
                                    }
                                    
                                    outlet.save(function(err, outlet){
                                        if (err || !outlet) {
                                          deferred.reject({
                                            err: err || true,
                                            message: 'Couldn\'t process feedback'
                                          });
                                        }
                                        else{
                                            deferred.resolve({
                                                data: order,
                                                message: 'feedback submitted successfully'
                                            });   
                                        }
                                            
                                    })

                                }
                            })
                            
                        }
                    })    
                }
              }
            );   
        }
        else if(order.update_type === 'update_delivery_status') {
            Order.findOne({
                _id: order.order_id
            }).populate('outlet').exec(function(err, saved_order) {
                if (err || !saved_order) {
                  deferred.reject({
                    err: err || true,
                    message: 'Couldn\'t find this order'
                  });
                } else {
                                                         
                    if(order.is_delivered) {
                        saved_order.order_status = 'DELIVERED';   
                    }
                    else{
                        //if is delivered is false then notify AM 
                        send_notification(['console', saved_order.outlet.basics.account_mgr_email.replace('.', '').replace('@', '')], {
                            message: 'Hey user said, order is not delivered please get back to user',
                            order_id: data.order_id,
                            type: 'NOT_DELIVERED'
                        });
                        var payload = {};
                        payload.from = 'TWYSTR';
                        payload.message = 'User said his order has not been delivered, Outlet name ' + saved_order.outlet.basics.name+ ' Order Number '+ saved_order.order_number;
                        payload.phone = saved_order.outlet.basics.account_mgr_phone;
                        Transporter.send('sms', 'vf', payload);
                    }
                                        
                    saved_order.save(function(err, order){
                        if(err || !order){
                            deferred.reject({
                                err: err || true,
                                message: 'Couldn\'t update this order'
                            });   
                        }
                        else{
                            if(order)
                            deferred.resolve({
                                data: order,
                                message: 'delivery status submitted successfully'
                            });
                        }
                    })    
                }
              }
            );   
        }
        else{
            console.log('unknown order update type')
            deferred.reject({
                err: err || true,
                message: 'unknown order update type'
            });   
        }
    
    }, function(err) {
        deferred.reject({
            err: err || false,
            message: 'Couldn\'t find the user'
        });
    });
    
    return deferred.promise;
}

function getItemPrice(item) {
    logger.log();
    var total_price = 0;
    if (!(item.option && item.option._id)) {
        return item.item_cost;
    } else {
        total_price += item.option.option_cost;
        if (item.option_is_addon === true) {
            total_price += item.item_cost;
        }
        if (item.option.sub_options && item.option.sub_options.length) {
            _.each(item.option.sub_options, function(sub_option) {
                total_price += sub_option.sub_option_set[0].sub_option_cost;
            });
        }
        if (item.option.addons && item.option.addons.length) {
            _.each(item.option.addons, function(addon) {
                _.each(addon.addon_set, function(addon_obj) {
                    total_price += addon_obj.addon_cost;
                });
            });
        }
        return total_price;
    }
};

function send_notification_to_user (gcm_id, notif) {
    logger.log();
  var payload = {};   

  payload.head = notif.header;
  payload.body = notif.message;  
  payload.state = notif.state;
  payload.time = notif.time;
  payload.gcms = gcm_id;
  payload.order_id = notif.order_id;

  Transporter.send('push', 'gcm', payload);
       
}

function send_notification(paths, payload) {
  logger.log();
  _.each(paths, function(path) {
    Transporter.send('faye', 'faye', {
      path: path, 
      message: payload
    });
  })
}