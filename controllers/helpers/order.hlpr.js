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
var Event = mongoose.model('Event');
var Coupon = mongoose.model('Coupon');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var OutletHelper = require('./outlet.hlpr');
var RecoHelper = require('./reco.hlpr');
var keygen = require('keygenerator');
var Bayeux = require('../../app_server');
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

module.exports.apply_coupon = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    
    var data = {};
    data.outlet = order.outlet;
    data.user_token = token;
    data.coupon_code = order.coupon_code;
    data.order_number = order.order_number;

    get_user(data)
    .then(function(data){
        return check_coupon_applicability(data);
    })
    .then(function(data){
        return apply_selected_coupon(data);
    })
    .then(function(data){
        return update_coupon_count(data);
    })
    .then(function(data) {
        var updated_data = {};
        updated_data.cashback = Math.round(data.order.cashback);
        deferred.resolve(updated_data);
    })
    .fail(function(err) {
        console.log(err)
      deferred.reject(err);
    });
    
    return deferred.promise;
}

module.exports.remove_coupon = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    
    var data = {};
    data.outlet = order.outlet;
    data.user_token = token;
    data.coupon_code = order.coupon_code;
    data.order_number = order.order_number;

    get_user(data)
    .then(function(data){
        return remove_selected_coupon(data);
    })
    .then(function(data){
        return update_coupon_count(data);
    })
    .then(function(data) {
        var updated_data = {};
        updated_data.cashback = Math.round(data.order.cashback);
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

function calculate_order_value(data) {
    logger.log();
    
    var items = data.items
    var menu = {};
    menu = data.outlet && data.outlet.menus[0];
    var items = data.items;
    var  amount = 0, vated_amount = 0;
    
    for(var i = 0; i < items.length; i++) {
        var selected_options = [], sub_options = [], addons = [], category, sub_category, item, option, menu_sub_options = [], order_sub_options = [], menu_addons = [], order_addons = [];
        category = _.findWhere(menu.menu_categories, {_id: items[i].category_id});
        sub_category = _.findWhere(category && category.sub_categories, {_id: items[i].sub_category_id});
        
        item = _.findWhere(sub_category && sub_category.items, {_id: items[i].item_id});
        items[i].item_details = item;
        items[i].menu_id = menu._id;
        console.log(items[i])
        if(item.option_is_addon && items[i].options && items[i].options.length) {
            _.each(item.options, function(menu_option){
                _.each(items[i].options, function(selected_option){
                    
                    if(selected_option === menu_option._id){
                        selected_options.push(menu_option);
                    }
                })
            })    
        }

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
         
        if(option && (item.option_price_is_additive)){
            console.log('in prices are additive option');
            var current_item_amount = 0;
            current_item_amount = item.item_cost*items[i].quantity;
            current_item_amount = current_item_amount + option.option_cost*items[i].quantity;
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    current_item_amount = current_item_amount + (sub_option.sub_option_cost*items[i].quantity);
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    current_item_amount = current_item_amount + (addon.addon_cost*items[i].quantity);
                })
            }    
            items[i].item_total_amount = current_item_amount;
            amount = amount+current_item_amount;
            if(menu.menu_item_type === 'type_3' && item.item_type === 'type_1'){
                vated_amount = vated_amount+current_item_amount;
            }
        }
        else if(selected_options && selected_options.length && item.option_is_addon){
            console.log('in option is addon');
            var current_item_amount = 0;
            current_item_amount = item.item_cost*items[i].quantity;
            
            _.each(selected_options, function(selected_option){
                current_item_amount = current_item_amount + selected_option.option_cost*items[i].quantity;
            })
                            
            items[i].item_total_amount = current_item_amount;
            amount = amount+current_item_amount;
            if(menu.menu_item_type === 'type_3' && item.item_type === 'type_1'){
                vated_amount = vated_amount+current_item_amount;
            }    
        }
        else if(option){            
            var current_item_amount = 0;
            current_item_amount = option.option_cost*items[i].quantity;
            
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    current_item_amount = current_item_amount + (sub_option.sub_option_cost*items[i].quantity);
                })
            }
           

            if(addons.length) {
                _.each(addons, function(addon){
                    current_item_amount = current_item_amount + (addon.addon_cost*items[i].quantity);
                    console.log(amount);
                })
            }           
            items[i].item_total_amount = current_item_amount;    
            amount = amount+current_item_amount;
            if(menu.menu_item_type === 'type_3' && item.item_type === 'type_1'){
                vated_amount = vated_amount+current_item_amount;
            }
        }
        else{
            console.log('without option');
            var current_item_amount = 0;
            current_item_amount = item.item_cost*items[i].quantity;
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    current_item_amount = current_item_amount + (sub_option.sub_option_cost*items[i].quantity);
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    current_item_amount = current_item_amount + (addon.addon_cost*items[i].quantity);
                })
            }
            items[i].item_total_amount = current_item_amount;
            amount = amount+current_item_amount;
            if(menu.menu_item_type === 'type_3' && item.item_type === 'type_1'){
                vated_amount = vated_amount+current_item_amount;
            }
        }
    }
    var amount_obj = {};
    amount_obj.amount = amount;
    amount_obj.vated_amount = vated_amount;
    console.log('order amount in calculate_order_value '+ amount_obj);
    
    return amount_obj;
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
    var time = parseInt(date.getHours())+5 +':'+parseInt(date.getMinutes())+30;
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
        && data.user.twyst_cash >= offer_cost && offer.actions.reward.applicability.delivery
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
    var items = passed_data.items;
    var order_value = calculate_order_value(passed_data);
    var free_item = searchItemInOfferItems(offer, items);

    if(free_item) {
        order_value.amount = order_value.amount - free_item.item_total_amount/free_item.quantity;    
        console.log(order_value);
        if(order_value.amount >= offer.minimum_bill_value) {
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
                offer.free_item_index = free_item.index;
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
    else{
        offer.is_applicable = false;                
        return offer;
    }           
}

function checkOfferTypeBuyXgetY(data, offer) {
    logger.log();
    var deferred = Q.defer();
    
    console.log('checking offer type bogo');
    var passed_data = data;
    var items = passed_data.items;
    var is_contain_paid_item = false;

    for(var i = 0; i < items.length; i++) {
        if(searchItemInPaidItems(items[i], offer)){
            is_contain_paid_item = true;
            break;
        }
    }
    console.log('is_contain_paid_item ' + is_contain_paid_item);
    
    var order_value = calculate_order_value(passed_data);
    var free_item  = searchItemInOfferItems(offer, items);
    if(is_contain_paid_item && free_item) {
        order_value.amount = order_value.amount - free_item.item_total_amount/free_item.quantity;
        if(order_value.amount >= offer.minimum_bill_value) {
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
                offer.free_item_index = free_item.index;
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
    else{
        offer.is_applicable = false;                
        console.log('offer not applicable');
        return offer;
    }   
                    
}

function checkOfferTypeFlatOff(data, offer) {
    logger.log();
    var deferred = Q.defer();

    console.log('checking offer type flatoff')
    var passed_data = data;
    var id = offer._id;

    var order_value = calculate_order_value(passed_data);
                
    console.log('for flat off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value.amount >= offer.minimum_bill_value) {
        console.log('offer applicable');

        order_value.amount = order_value.amount - offer.actions.reward.reward_meta.off;
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

    var order_value = calculate_order_value(passed_data);
                
    console.log('for percentage off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value.amount >= offer.minimum_bill_value) {
        discount = (order_value.amount * offer.actions.reward.reward_meta.percent)/100;
        if(discount <= offer.actions.reward.reward_meta.max) {
            order_value.amount = order_value.amount - discount;            
        }
        else {
            order_value.amount = order_value.amount - offer.actions.reward.reward_meta.max;               
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
    
    var order_actual_value_obj = calculate_tax(calculate_order_value(data), data.outlet);    
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
    order_actual_value_obj = calculate_tax(calculate_order_value(passed_data), passed_data.outlet);

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
    order.payment_options = passed_data.outlet.valid_zone.payment_options;
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


function check_coupon_applicability (data) {
    logger.log();
    var deferred = Q.defer();

    Coupon.findOne({
        'code': data.coupon_code
    }).exec(function(err, coupon){
        if(err || !coupon){
            //no such coupon code exists
            deferred.reject({
                err: err || true,
                message: 'Invalid coupon code'
            });
        }
        else{
            data.coupon = coupon;
            if (isExpired(data.coupon)) {
                deferred.reject({
                    err: err || true,
                    message: 'Coupon has expired'
                });                
            }

            if (isUsedTooMany(data.coupon)) {
                deferred.reject({
                    err: err || true,
                    message: 'Coupon has been used too many times'
                });
            }

            if(!isApplicableAtOutlet(data)){
                deferred.reject({
                    err: err || true,
                    message: 'Coupon is not applicable at this outlet'
                });   
            }

            if(isOnFirstOrder(data)){
                deferred.reject({
                    err: err || true,
                    message: 'Coupon is available only on first order'
                }); 
            }

            if(isAlreadyUsed(data)){
                deferred.reject({
                    err: err || true,
                    message: 'Coupon has already been used by you'
                });   
            }

            deferred.resolve(data);
        }
    })
    return deferred.promise;   
}


function isExpired(coupon) {
  if (new Date(coupon.validity.start) < new Date() && new Date(coupon.validity.end) > new Date()) {
    return false;
  }
  return true;
}

function isUsedTooMany(coupon) {
  if (coupon.times_used <= coupon.max_use_limit) {
    return false;
  }
  return true;
}

function isApplicableAtOutlet(data) {
    if(data.coupon.outlets && data.coupon.outlets.length){
        var index = _.findIndex(data.coupon.outlets, function(outlet) { return outlet.toString() == data.outlet.toString(); });
        if(index === -1) {
            return false;
        }
        else {
            return true;
        }
    }
    else{
        return true;
    }
}

function isOnFirstOrder(data) {
    console.log(data.coupon.only_on_first_order);
    console.log(data.user.orders);
    if(data.coupon.only_on_first_order && 
        data.user.orders && data.user.orders.length) {
        return true;
    }
    else{
        return false;
    }
}

function isAlreadyUsed(data) {
    var per_user_limit = data.coupon.per_user_limit;
    if(data.user.coupons && data.user.coupons.length) {
        var used_coupons = [];
        _.each(data.user.coupons, function(coupon){
            if(coupon === data.coupon._id) {
                used_coupons.push(coupon);
            }
        })
        if(used_coupons.length >= per_user_limit) {
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


function apply_selected_coupon(data) {
    logger.log();
    var deferred = Q.defer();

    Cache.hget(data.user._id, 'order_map', function(err, reply) {
        if(!reply) {
            deferred.reject({
                err: err || true,
                message: 'no coupon available for user'
            });
        }
        else{
            var order = JSON.parse(reply);
            console.log(data.order_number);
            console.log(order.order_number)
            if(data.order_number.toString() === order.order_number.toString()) {
                
                if(data.coupon.actions.reward.reward_meta.reward_type === 'percentageoff') {
                    if(!order.offer_used){
                        if(data.coupon.actions.reward.reward_meta.minimum_bill_value && order.order_actual_value_without_tax >= data.coupon.actions.reward.reward_meta.minimum_bill_value) {
                            var cashback = (order.order_actual_value_without_tax * data.coupon.actions.reward.reward_meta.percent)/100;
                            if(cashback > data.coupon.actions.reward.reward_meta.max) {
                                cashback = data.coupon.actions.reward.reward_meta.max;     
                            }
                            order.coupon_used = data.coupon._id;
                            order.cashback = cashback;
                            order.cashback_percentage = data.coupon.actions.reward.reward_meta.percent;
                            Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
                               if(err) {
                                 logger.log(err);
                               }
                               else{
                                    console.log('order found coupon applied');
                                    data.order = order;
                                    deferred.resolve(data);
                               }
                                
                            }); 
                        }  
                        else{
                            deferred.reject({
                                err: err || true,
                                message: 'Minimum order amount to use this coupon code is ' + data.coupon.actions.reward.reward_meta.minimum_bill_value
                            });
                        }           
                    }
                    else{
                        if(data.coupon.actions.reward.reward_meta.minimum_bill_value && order.offer_used.order_value_without_tax >= data.coupon.actions.reward.reward_meta.minimum_bill_value) {
                            var cashback = (order.offer_used.order_value_without_tax * data.coupon.actions.reward.reward_meta.percent)/100;
                            if(cashback > data.coupon.actions.reward.reward_meta.max) {
                                cashback = data.coupon.actions.reward.reward_meta.max;    
                            }
                            order.coupon_used = data.coupon._id;
                            order.cashback = cashback;
                            order.cashback_percentage = data.coupon.actions.reward.reward_meta.percent;
                            Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
                               if(err) {
                                 logger.log(err);
                               }
                               else{
                                    console.log('order found coupon applied');
                                    data.order = order;
                                    deferred.resolve(data);
                               }
                            });    
                        }
                        else{
                            deferred.reject({
                                err: err || true,
                                message: 'Minimum order amount to use this coupon code is ' + data.coupon.actions.reward.reward_meta.minimum_bill_value
                            });
                        }   
                    }
                }
                else{
                    deferred.reject({
                        err: err || true,
                        message: 'Invalid Coupon Code'
                    });      
                }
            }
            else {                
                deferred.reject('order not found');
            }
        } 
    })
    return deferred.promise;
}

function remove_selected_coupon(data) {
    logger.log();
    var deferred = Q.defer();

    Cache.hget(data.user._id, 'order_map', function(err, reply) {
        if(!reply) {
            deferred.reject('no coupon available for user')
        }
        else{
            var order = JSON.parse(reply);
            console.log(data.order_number);
            console.log(order.order_number)
            if(data.order_number.toString() === order.order_number.toString()) {
                if(order.coupon_used) {
                    order.coupon_used = null;
                    order.cashback = 0;
                    order.cashback_percentage = 0;
                    
                    Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
                        if(err) {
                            logger.log(err);
                        }
                        else{
                            data.order = order;
                            deferred.resolve(data);
                        }
                    });
                }
                else{
                    deferred.reject({
                        err: err || true,
                        message: 'no coupon has been applied'
                    });    
                }
            }
            else {                
                deferred.reject({
                    err: err || true,
                    message: 'order not found'
                });
            }
        } 
    })
    return deferred.promise;
}

function update_coupon_count(data) {
    logger.log();
    var deferred = Q.defer();

    var update_query;
    if(data.order.coupon_used){
        update_query = {
            $inc: {
              times_used: 1
            }
        }    
    }
    else{
        update_query = {
            $inc: {
              times_used: -1
            }
        }   
    }

    Coupon.findOneAndUpdate({
        code: data.coupon_code
    }, update_query, function(err, qr) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(data);
        }
    });
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
    console.log(order_value);
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
        vat = order_value.amount*tax_grid.vat/100;
        surcharge_on_vat = vat*tax_grid.surcharge_on_vat/100;        
    }
    else if(outlet.menus[0].menu_item_type === 'type_3'){
        console.log(outlet.menus[0].menu_item_type);               
        vat = order_value.vated_amount*tax_grid.vat/100;
        surcharge_on_vat = vat*tax_grid.surcharge_on_vat/100;        
    }

    if(outlet.menus[0].charge_service_tax) {        
        st = order_value.amount*tax_grid.st_applied_on_percentage/100*tax_grid.st/100;
        sbc = order_value.amount*tax_grid.st_applied_on_percentage/100*tax_grid.sbc/100;     
    }
        
    if(outlet.valid_zone.has_packaging_charge && 
        outlet.valid_zone.packaging_charge.is_fixed) {
        packaging_charge = outlet.valid_zone.packaging_charge.value || 0;
    }

    if(outlet.valid_zone.delivery_charge && !outlet.valid_zone.free_delivery_amt) {
        delivery_charge = outlet.valid_zone.delivery_charge || 0;
    }
    else if(outlet.valid_zone.delivery_charge && outlet.valid_zone.free_delivery_amt && order_value.amount < outlet.valid_zone.free_delivery_amt) {
        delivery_charge = outlet.valid_zone.delivery_charge || 0;   
    }
    console.log(vat + ' ' + surcharge_on_vat + ' ' + st + ' ' + sbc + ' ' + packaging_charge + ' ' + delivery_charge);
    new_order_value = order_value.amount+vat+surcharge_on_vat+st+sbc+packaging_charge+delivery_charge;
    
    order_value_obj.vat = vat+surcharge_on_vat;
    order_value_obj.st = st+sbc;
    order_value_obj.packaging_charge = packaging_charge;
    order_value_obj.delivery_charge = delivery_charge;
    order_value_obj.new_order_value = new_order_value;
    order_value_obj.order_value = order_value.amount;
    order_value_obj.order_value_with_tax = order_value.amount+vat+surcharge_on_vat+st+sbc;

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
                massaged_item.menu_id = item.menu_id; 
                massaged_item.category_id = item.category_id;
                massaged_item.sub_category_id = item.sub_category_id;               
                massaged_item._id = item.item_details._id;                
                massaged_item.item_name = item.item_details.item_name;
                massaged_item.item_quantity = item.quantity;
                massaged_item.is_vegetarian = item.is_vegetarian;
                massaged_item.item_rating = item.item_rating;
                massaged_item.item_description = item.item_details.item_description;
                massaged_item.item_photo = item.item_details.item_photo;
                massaged_item.item_tags = item.item_details.item_tags;
                massaged_item.item_cost = item.item_details.item_cost;
                massaged_item.option_is_addon = item.item_details.option_is_addon;
                massaged_item.option_price_is_additive = item.item_details.option_price_is_additive;
                
                if(item.options && item.options.length) {
                    massaged_item.option_ids = item.options;    
                }
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
                order.payment_options = order.payment_options;
                if(order.offer_used) {
                    order.order_value_without_offer = Math.round(order.order_actual_value_without_tax);
                    order.order_value_with_offer = Math.round(order.offer_used.order_value_without_tax);
                    order.tax_paid = order.offer_used.st+order.offer_used.vat;
                    order.actual_amount_paid = Math.round(order.offer_used.order_value_with_tax);
                    order.offer_cost = order.offer_used.offer_cost;
                }
                else {
                    order.offer_used = null;
                    order.order_value_without_offer = Math.round(order.order_actual_value_without_tax);
                    order.order_value_with_offer = null;
                    order.tax_paid = order.st+order.vat;
                    order.actual_amount_paid = Math.round(order.order_actual_value_with_tax);
                }
                //setup cashback info
                if(order.coupon_used) {
                    console.log('here');
                    console.log(order.cashback)
                    console.log(order.cashback_percentage)
                    order.cod_cashback = 0
                    order.inapp_cashback = Math.round(order.cashback);
                    order.cod_cashback_percenatage = 0;
                    order.inapp_cashback_percenatage = order.cashback_percentage;
                    order.payment_options = _.without(order.payment_options, 'cod');
                }
                else{
                    if(!order.offer_used && data.outlet.twyst_meta.cashback_info
                    && data.outlet.twyst_meta.cashback_info.base_cashback) {
                        console.log('cashback setup');
                        var cod_cashback = 0, inapp_cashback = 0, order_amount_ratio = 1;

                        if(data.outlet.twyst_meta.cashback_info.order_amount_slab.length) {
                            order_amount_ratio = _.find(data.outlet.twyst_meta.cashback_info.order_amount_slab, function(slab){
                                if(order.order_actual_value_without_tax >= slab.start &&
                                    order.order_actual_value_without_tax <= slab.end) {
                                    return slab.ratio;
                                }
                            });    
                        }
                        
                        var inapp_ratio = data.outlet.twyst_meta.cashback_info.in_app_ratio;
                        var cod_ratio = data.outlet.twyst_meta.cashback_info.cod_ratio;
                        var base_cashback = data.outlet.twyst_meta.cashback_info.base_cashback;
                        
                        var order_amount_cashback = order.order_actual_value_without_tax*base_cashback * order_amount_ratio /100;
                        cod_cashback = order.order_ctual_value_without_tax*base_cashback * cod_ratio /100;
                        inapp_cashback = order.order_actual_value_without_tax*base_cashback * inapp_ratio /100;
                        cod_cashback = _.max([base_cashback, order_amount_cashback, cod_cashback], function(cashback){ return cashback; });
                        inapp_cashback = _.max([base_cashback, order_amount_cashback, inapp_cashback], function(cashback){ return cashback; });
                        order.cod_cashback = Math.round(cod_cashback);
                        order.inapp_cashback = Math.round(inapp_cashback);
                        order.cod_cashback_percenatage = _.max([base_cashback*cod_ratio, base_cashback*order_amount_ratio], function(cashback){ return cashback; });
                        order.inapp_cashback_percenatage = _.max([base_cashback*inapp_ratio, base_cashback*order_amount_ratio], function(cashback){ return cashback; });
                        order.cod_cashback_percenatage = order.cod_cashback_percenatage.toFixed(2);
                        order.inapp_cashback_percenatage = order.inapp_cashback_percenatage.toFixed(2);
                    }
                    else{
                        console.log('cashback not setup');
                        order.cod_cashback = 0;
                        order.inapp_cashback = 0;   
                        
                    }    
                }
                
                var order_json = order;
                order = new Order(order); 
    
                order.save(function(err, saved_order){
                    if(err){
                        console.log(err);
                        deferred.reject('unable to checkout');
                    }
                    else{
                        order_json._id = saved_order._id;
                        data.order = order_json;
                        data.order.mobikwik_cashback = 'Get extra 10% cashback in mobikwik wallet'; 
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

    if(data.order.address.tag){
        var passed_address = data.order.address;
        
        User.findOne({_id: data.user._id}).exec(function(err, user){
            if(err) {
                deferred.reject(err);
            }
            else{
                
                for(var i = 0; i < user.address.length; i++){
                    if(user.address[i].tag === passed_address.tag){
                        console.log('address exists');
                        user.address.splice(i); 
                    }    
                }
                console.log(user.address)
                user.address.push(passed_address);
                user.save(function(err, updated_user){
                    if(err) {
                        deferred.reject(err);
                    }
                    else{
                        deferred.resolve(data);     
                    }
                })   
            }
        })
    }
    else{
        deferred.resolve(data);   
    }
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
    
    if(category_id !== -1 && sub_category_id !== -1 && item_id
     !== -1 && !item.option && !item.addons.length && !item.sub_options.length){

        return true; 
    }
    else if(category_id !== -1 && sub_category_id !== -1 && item_id
     !== -1 && option_id !== -1 && !item.addons.length && !item.sub_options.length){
        return true; 
    }
    else if(category_id !== -1 && sub_category_id !== -1 && item_id
     !== -1 && option_id !== -1 && item.addons && addons && addons.length
     && !item.sub_options.length){
        return true;   
    }
    else if(category_id !== -1 && sub_category_id !== -1 && item_id
     !== -1 && option_id !== -1 && item.sub_options && sub_options && sub_options.length
     && !item.addons.length){
        return true;   
    }
    else if(category_id !== -1 && sub_category_id !== -1 && item_id
     !== -1 && option_id !== -1 && item.sub_options && sub_options && sub_options.length
     && item.addons && addons && addons.length){
        return true;
    } 
    else {
        return false;
    }
}

function searchItemInOfferItems(offer, items) {
    logger.log();

    var free_items = [];
    for(var i = 0; i < items.length; i++) {
        var category_id = _.findIndex(offer.offer_items.categories, function(current_category) {
            return current_category.toString() == items[i].category_id;
        });
        
        var sub_category_id = _.findIndex(offer.offer_items.sub_categories, function(sub_category_id) {
            return sub_category_id.toString() == items[i].sub_category_id;
        });

        var item_id = _.findIndex(offer.offer_items.items, function(item_id) {
            return item_id.toString() == items[i].item_id;
        });
       
        var option_id = _.findIndex(offer.offer_items.options, function(option_id) {
            return option_id.toString() == items[i].option_id;
        });

        var sub_options = _.intersection(offer.offer_items.sub_options, items[i].sub_options);
       
        
        var addons = _.intersection(offer.offer_items.addons, items[i].addons);

        if(category_id !== -1 && sub_category_id !== -1 && item_id
        !== -1 && !items[i].options && !items[i].addons.length && !items[i].sub_options.length){
            items[i].index = i;
            free_items.push(items[i]);
        }
        else if(category_id !== -1 && sub_category_id !== -1 && item_id
        !== -1 && option_id !== -1 && !items[i].addons.length && !items[i].sub_options.length){
            items[i].index = i;
            free_items.push(items[i]);
        }
        else if(category_id !== -1 && sub_category_id !== -1 && item_id
        !== -1 && option_id !== -1 && items[i].addons && addons && addons.length
        && !items[i].sub_options.length){
            items[i].index = i;
            free_items.push(items[i]);
        }
        else if(category_id !== -1 && sub_category_id !== -1 && item_id
        !== -1 && option_id !== -1 && items[i].sub_options && sub_options && sub_options.length
        && !items[i].addons.length){
            items[i].index = i;
            free_items.push(items[i]);
        }
        else if(category_id !== -1 && sub_category_id !== -1 && item_id
        !== -1 && option_id !== -1 && items[i].sub_options && sub_options && sub_options.length
        && items[i].addons && addons && addons.length){
            items[i].index = i;
            free_items.push(items[i]);
        } 
    }
    console.log(free_items);
    var free_item;
    if(free_items.length) {
        free_item = _.min(free_items, function(item){return item.item_total_amount/item.quantity});
    }
    else{
        free_item = null;
    }
    console.log(free_item);
    return free_item;  
}

module.exports.get_order = function(token, order_id) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
      
        Order.findOne({ _id: order_id}).populate('outlet user').exec(function(err, order) {
            if (err || !order) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t find the order'
              });
            } else {
                var orders = [];
                orders.push(order);
                process_orders(orders, deferred, 'one');                
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
                    process_orders(orders, deferred, 'all');
                }
            });
        } else if (data.data.role >= 2 && data.data.role < 6) {
            Order.find({}, {
                //outlet: {
                //    $in: data.data.outlets
                //}
            }).populate('outlet user').exec(function(err, orders) {
                if (err || !orders) {
                    deferred.reject({
                        err: err || false,
                        message: 'Unable to load orders'
                    });
                } else {
                    process_orders(orders, deferred, 'all');
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
                    process_orders(orders, deferred, 'all');
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
        return remove_order_from_cache(data);
    })
    .then(function(data) {
        return save_offer_use_event(data);
    })    
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
        return update_user_twyst_cash(data.order);
    })
    .then(function(data) {
        deferred.resolve(data);
    })
    .fail(function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
}


module.exports.confirm_inapp_order = function(data) {
    logger.log();
    var deferred = Q.defer();

    update_payment_mode(data)
    .then(function(data) {
        return remove_order_from_cache(data);
    })
    .then(function(data) {
        return save_offer_use_event(data);
    })
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
        return update_user_twyst_cash(data.order);
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

function process_orders(orders, deferred, check) {
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
            updated_order.delivery_experience = order.outlet.twyst_meta.rating.value.toFixed(1);   
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
        updated_order.notified_am = order.notified_am;
        return updated_order;
    });
    if(check === 'all') {
        deferred.resolve({
            data: processed_orders,
            message: 'found the orders'
        });    
    }
    else{
        deferred.resolve({
            data: processed_orders[0],
            message: 'found the orders'
        });    
    }
    
}

function update_payment_mode(data) {
    logger.log();
    var deferred = Q.defer();
    var is_inapp = false, card_id;
    var cashback = 0;
    if(data.payment_mode !== 'COD') {
        is_inapp = true;
    }

    if(data.payment_mode.charAt(0) === 'N') {
        data.payment_method = data.payment_mode;
        data.payment_mode = 'Zaakpay';
    };

    if(data.card_id != 'NA' && data.payment_mode !== 'COD') {
        card_id = data.card_id;
        data.payment_method = data.payment_mode;
        data.payment_mode = 'Zaakpay';
    }

    Order.findOne({
        order_number: data.order_number
    }).exec(function(err, order){
        if(err || !order){
            deferred.reject(err);
        }
        else{
            order.order_status = 'PENDING';
            order.payment_info.is_inapp = is_inapp;
            order.payment_info.payment_mode = data.payment_mode;
            order.payment_info.payment_method = data.payment_method;
            order.payment_info.card_id = data.card_id;
            
            order.save(function(err, order){
                if(err || !order){
                    console.log(err);
                    deferred.reject(err);
                }
                else{
                    data.order_id = order && order._id; 
                    data.order = order;
                    deferred.resolve(data);
                }
            })            
        }
    })
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
    var address = ' Address: '+data.order.address.line1 + ' ' + data.order.address.line2 + ' Landmark: '+data.order.address.landmark;

    payload.message = outlet_name + name  + phone + address + ' Order Details: ';

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
    var time = new Date() ;
    time = time.getTime();
    time = parseInt(time)+ parseInt(330*60*1000);
    time = new Date(time);
    var placed_at =  ' Placed at: ' + time.getHours()+':'+time.getMinutes();
    
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
    var am_payload = {};
    am_payload.from = 'TWYSTR';
    console.log(data.outlet.contact.phones.reg_mobile[0]);
    var outlet_phone =  data.outlet.contact.phones.mobile[0].num;
    am_payload.message = payload.message  +order_number+placed_at+delivery_time+total_amount+collected_amount + ' Outlet number ' + outlet_phone;
    am_payload.phone = data.outlet.basics.account_mgr_phone;
    Transporter.send('sms', 'vf', am_payload);
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
            ToAddresses: [ account_mgr_email, merchant_email] 
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data: 
                    "<h4>Outlet</h4>" + data.outlet.basics.name +
                    "<h4>Order Number</h4>" + data.order.order_number +
                    "<h4>Name</h4>" + name
                    + "<h4>Phone</h4>" + phone 
                    + "<h4>Address</h4>" + data.order.address.line1 + ' ' + data.order.address.line2 + ' Landmark: '+data.order.address.landmark
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

function send_order_close_notification(order) {
    logger.log();
    var deferred = Q.defer();

    send_notification(['console', order.outlet_detail.basics.account_mgr_email.replace('.', '').replace('@', '')], {
        message: 'Order has been closed by user',
        order_id: order._id,
        type: 'order_closed'
    });
    
    deferred.resolve(order); 
    return deferred.promise;       
}


module.exports.update_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    
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
            update_order_with_feedback(order)
            .then(function(data) {
                return update_outlet_rating(data);
            })
            .then(function(data) {
                return update_user_twyst_cash(data);
            })
            .then(function(data) {
                return save_order_feedback_event(data);
            })
            .then(function(data) {
                return send_order_close_notification(data);
            })
            .then(function(data) {
                deferred.resolve(data);
            })
            .fail(function(err) {
                console.log(err);
                deferred.reject(err);
            });   
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
                        var current_action = {};
                        current_action.action_type = 'DELIVERED';
                        current_action.action_by = data.data._id;
                        current_action.message = 'Your order has been delivered.';
                        saved_order.actions.push(current_action);
                        send_notification(['console', saved_order.outlet.basics.account_mgr_email.replace('.', '').replace('@', '')], {
                            message: 'Order has been delivered to user',
                            order_id: order.order_id,
                            type: 'delivered'
                        });  
                    }
                    else{
                        saved_order.order_status = 'NOT_DELIVERED';
                        //if is delivered is false then notify AM 
                        send_notification(['console', saved_order.outlet.basics.account_mgr_email.replace('.', '').replace('@', '')], {
                            message: 'Hey user said, order is not delivered please get back to user',
                            order_id: order.order_id,
                            type: 'not_delivered'
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
        if (item.option_is_addon === true || item.option_price_is_additive === true) {
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

function save_order_feedback_event(data) {
    logger.log();

    var deferred = Q.defer();
    var event = {};
    var passed_data = data;
    event.event_meta = {};
    event.event_meta.order_number = passed_data.order_number;
    event.event_meta.twyst_cash = passed_data.cashback;
    event.event_meta.payment_mode = passed_data.payment_info.payment_mode;
    if(passed_data.offer_used) {
        event.event_meta.amount = passed_data.order_value_with_offer;    
    }
    else{
        event.event_meta.amount = passed_data.order_value_without_offer;
    }
    

    event.event_user = passed_data.user;
    event.event_type = 'order_feedback';
    
    event.event_outlet = passed_data.outlet;
    event.event_date = event.event_date || new Date();
    var created_event = new Event(event);
    created_event.save(function(err, e) {
        if (err || !e) {
            deferred.reject('Could not save the event - ' + JSON.stringify(err));
        } else {
            deferred.resolve(data);
        }
    });

    return deferred.promise;
}

function update_order_with_feedback(order) {
    logger.log();
    var deferred = Q.defer();
    Order.findOne({_id: order.order_id
    }).populate('user').exec( function(err, saved_order) {
        if (err || !saved_order) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t find this order'
          });
        } 
        else if(saved_order.status != 'CLOSED'){
            saved_order.user_feedback = {};
            saved_order.user_feedback.is_ontime = order.is_ontime;
            saved_order.user_feedback.rating = order.order_rating;
            saved_order.order_status = 'CLOSED';
            var current_action = {};
            current_action.action_type = 'CLOSED';
            current_action.action_by = saved_order.user._id;
            current_action.message = 'Order feedback submitted successfully.';
            saved_order.actions.push(current_action);  
            if(order.items_feedback) {
                saved_order.items = order.items;    
            }
            if(saved_order.payment_info.is_inapp) {
                saved_order.cashback = saved_order.inapp_cashback;    
            }
            else if(saved_order.payment_info.payment_mode === 'COD'){
                saved_order.cashback = saved_order.cod_cashback;        
            }
            saved_order.save(function(err, updated_order){
                if(err || !updated_order){
                    deferred.reject({
                        err: err || true,
                        message: 'Couldn\'t update this order'
                    });   
                }
                else{
                    deferred.resolve(updated_order); 
                }
            })
        }
        else{
            deferred.reject({
                err: err || true,
                message: 'Order feedback already submitted'
            });
        }
    })
    return deferred.promise;
}

function update_outlet_rating(order){
    logger.log();
    var deferred = Q.defer();
    Outlet.findOne({_id: order.outlet}, function(err, outlet) {
        if (err || !outlet) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t process feedback'
          });
        }
        else{
            if(outlet.twyst_meta.rating && outlet.twyst_meta.rating.value) {
                var count = outlet.twyst_meta.rating.count+1;
                var rating = outlet.twyst_meta.rating.value;
                rating = ((rating*outlet.twyst_meta.rating.count)+order.user_feedback.rating)/count;
                outlet.twyst_meta.rating.value = rating;
                outlet.twyst_meta.rating.count = count;    
            }
            else{
                outlet.twyst_meta.rating.value = order.user_feedback.rating;
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
                    order.outlet_detail = outlet;
                    deferred.resolve(order);   
                }
            })

        }
    })
    return deferred.promise;
}

function update_user_twyst_cash(order) {
    logger.log();
    var deferred = Q.defer();
    
    User.findOne({_id: order.user}, function(err, user) {
        if (err || !user) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t find this order'
          });
        } 
        else if(order.offer_used && order.order_status === 'PENDING'){
            user.twyst_cash = user.twyst_cash-order.offer_cost;            
        }
        else if(order.order_status != 'PENDING'){
            if(order.payment_info.is_inapp) {
                user.twyst_cash = user.twyst_cash+order.inapp_cashback;    
            }
            else if(order.payment_info.payment_mode === 'COD'){
                user.twyst_cash = user.twyst_cash+order.cod_cashback;        
            }    
        }
        var user_order_obj = {};
        user_order_obj.order_id = order._id;
        user_order_obj.outlet_id = order.outlet;
        user.orders.push(user_order_obj);
        if(order.coupon_used) {
            var coupon = {};
            coupon._id = order.coupon_used;
            user.coupons.push(coupon);
        }
        user.save(function(err, user){
            if(err || !user){
                deferred.reject('Couldn\'t update user cashback');   
            }
            else{
                deferred.resolve(order); 
            }
        })
    })
    return deferred.promise;
}

function save_offer_use_event(data) {
    logger.log();
    var deferred = Q.defer();
    
    if(data.order.offer_used) {
        var event = {};                        
        event.event_meta = {};
        event.event_meta.order_number = data.order.order_number;
        event.event_meta.twyst_cash = data.order.offer_cost;
        event.event_meta.offer = data.order.offer_used;
        event.event_meta.amount = data.order.actual_amount_paid;
        event.event_user = data.order.user;
        event.event_type = 'use_food_offer';
        
        event.event_outlet = data.order.outlet;
        event.event_date =  new Date();
        var created_event = new Event(event);
        created_event.save(function(err, e) {
            if (err || !e) {
                deferred.reject('Could not save the event - ' + JSON.stringify(err));
            } else {
                deferred.resolve(data);
            }
        });    
    }
    else{
        deferred.resolve(data);
    }
    return deferred.promise;   
}