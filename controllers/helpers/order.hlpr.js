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
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var OutletHelper = require('./outlet.hlpr');
var OutletHelper = require('./outlet.hlpr');
var RecoHelper = require('./reco.hlpr');
var keygen = require('keygenerator');
var Bayeux = require('../../app_server');
var PaymentHelper = require('./payment.hlpr');
var TaxConfig = require('../../config/taxes.cfg');


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
    .then(function(data){
        return massage_offer(data);
    })
    .then(function(data){
        return generate_and_cache_order(data);
    })
    .then(function(data) {
        var updated_data = {};
        updated_data.items = data.order.items;
        updated_data.order_number = data.order.order_number;
        updated_data.order_actual_value = data.order.order_actual_value;
        console.log(updated_data);
        updated_data.offers = [];
        _.each(data.order.available_offers, function(offer){
           updated_data.offers.push(offer); 
        })
        console.log(data.outlet._id)
        var a = Bayeux.bayeux.getClient().publish('/'+data.outlet._id, {text: 'yaaaaaaa u have a new order'});
        a.then(function() {
          console.log('delivers');
        }, function(error) {
          console.log('problem');
        });
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
    data.items = order.items;
    data.outlet = order.outlet;
    data.user_token = token;
    data.used_offer = order.used_offer;
    data.order_number = order.order_number;

    get_user(data)
    .then(function(data){
        return get_outlet(data);
    })
    .then(function(data){
        return apply_selected_offer(data);
    })
    .then(function(data) {
        //console.log(data);
        var updated_data = {};
        updated_data.order_number = data.order_number;
        updated_data.items = data.items;
        updated_data.order_value = data.order_value;
        updated_data.applied_offer = data.applied_offer || null;
       
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

    var data = {};
    data.items = order.items;
    data.outlet = order.outlet;
    data.user_token = token;
    data.order_number = order.order_number;
    data.address = order.address
    
    get_user(data)
    .then(function(data) {
        return massage_order(data);
    })
    .then(function(data) {
        Cache.hget(data.user._id, 'order_map', function(err, reply) {
            if(!reply) {
                deferred.reject('can not process this order')
            }
            else{
                console.log('here');
                var order = JSON.parse(reply);
                if(data.order_number === order.order_number) {
                    PaymentHelper.make_payment(data).then(function(data){
                        var order = {};                        
                        order.address = data.address;
                        order.outlet = data.outlet;
                        order.order_number = data.order_number;
                        order.offer_used = data.offer_used;
                        order.order_value_without_offer = 500
                        order.order_value_with_offer = 400
                        order.tax_paid = 12;
                        order.cash_back = 20;
                        order.order_status = 'pending';
                        order.items = data.items;

                        order = new Order(order);
                        console.log(data.items)
                        order.save(function(err, order){
                            if(err){
                                console.log(err);
                                deferred.reject('unable to checkout ');
                            }
                            else{
                                console.log('saved')
                                deferred.resolve(data);   
                            }
                        })    
                    })
                    
                }
                else{
                    deferred.resolve(data);   
                }
            }
        })    
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
    
    if(!passed_data.items && passed_data.items.length){
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
    console.log('free_item ' + data);
    var passed_data = data;
    var items = data.items
    var menu = {};
    menu = data.outlet && data.outlet.menus[0];
    var items = data.items;
    var category, sub_category, item, option, sub_options = [], menu_sub_options,
     order_sub_options, menu_addons,order_addons, addons = [], amount = 0;
    
    for(var i = 0; i < items.length; i++) {
        category = _.findWhere(menu.menu_categories, {_id: items[i].category_id});
        
        var sub_category = _.findWhere(category.sub_categories, {_id: items[i].sub_category_id});
        item = _.findWhere(sub_category.items, {_id: items[i].item_id});
        if(item.options && items[i].option_id) {
            option = _.findWhere(item.options, {_id: items[i].option_id});
            console.log(option);    
        }
        
        if(option && option.sub_options && items[i].sub_options) {
            menu_sub_options = option.sub_options;
            order_sub_options = items[i].sub_options;
        }
        console.log(menu_sub_options);
        console.log(order_sub_options);
        _.each(menu_sub_options, function(sub_option){
            _.each(order_sub_options, function(order_sub_option){
                sub_option = _.findWhere(sub_option.sub_option_set, {_id: order_sub_option})
                console.log(sub_option);
                if(sub_option){
                    sub_options.push(sub_option);
                }
            })
        })
        console.log(sub_options);
        _.each(menu_addons, function(addon){
            _.each(order_addons, function(order_addon){
                addon = _.findWhere(addon.addon_set, {_id: order_addon})
                console.log(addon);
                if(addon){
                    addons.push(addon);
                }
            })
        })
        console.log(addons);
        
        console.log(items[i].quantity +'quantity')
        if(item._id === free_item && option) {
            amount = amount+(option.option_cost*(items[i].quantity-1));
            if(sub_options.length) {
                for(var i = 0; i < sub_options.length-1; i++) {
                    amount = amount + sub_option[i].sub_option_cost;
                }               
            }
            if(addons.length) {
                for(var i = 0; i < addons.length-1; i++) {
                    amount = amount + addons[i].addon_cost;
                }
            }
        }
        else if(item._id === free_item && !option) {
            amount = amount+(item.item_cost*(items[i].quantity-1));           
            if(sub_options.length) {
                for(var i = 0; i < sub_options.length-1; i++) {
                    amount = amount + sub_option[i].sub_option_cost;
                }               
            }
            if(addons.length) {
                for(var i = 0; i < addons.length-1; i++) {
                    amount = amount + addons[i].addon_cost;
                }
            }
        }         
        else if(option){
            amount = amount+(option.option_cost*items[i].quantity);
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + sub_option.sub_option_cost;
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + addon.addon_cost;
                })
            }
        }
        else {
            amount = amount+(item.item_cost*items[i].quantity);
            if(sub_options.length) {
                _.each(sub_options, function(sub_option){
                    amount = amount + sub_option.sub_option_cost;
                })
            }
            if(addons.length) {
                _.each(addons, function(addon){
                    amount = amount + addon.addon_cost;
                })
            }               
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
        offer.is_already_checked = false;
    })
    passed_data.outlet.offers = _.map(data.outlet.offers, function(offer) {
        offer_cost = offer.offer_cost || 0;
        //console.log(offers[i].actions.reward.reward_meta.reward_type)
        if(offer.offer_status === 'active' && new Date(offer.offer_end_date) > new Date()
        && !(RecoHelper.isClosed(date, time, offer.actions.reward.reward_hours))
        && data.user.twyst_bucks >= offer_cost && offer.offer_type === 'offer' || offer.offer_type === 'coupon'){
            //console.log('should be here')
            if(offer.actions.reward.reward_meta.reward_type === 'free') {
                return checkFreeItem(data, offer);
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'bogo') {
                return checkOfferTypeBogo(data, offer);  
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'discount') {
                return checkOfferTypePercentageOff(data, offer);
                
            }
            else if(offer.actions.reward.reward_meta.reward_type === 'flatoff') {
                return checkOfferTypeFlatOff(data, offer);
                
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

    for(var i = 0; i < items.length; i++) {

        if(!offer.is_already_checked && offer.offer_items && offer.offer_items.category_id === items[i].category_id
            && offer.offer_items.sub_category_id === items[i].sub_category_id
            && offer.offer_items.item_id === items[i].item_id
            || offer.offer_items.option_id === items[i].option_id
            || (items[i].sub_option_id && offer.offer_items.sub_option_id) === (items[i].sub_option_id)
            || (items[i].addon_id && offer.offer_items.sub_option_id.add_ons) === items[i].addon_id){
            
            var order_value = calculate_tax(calculate_order_value(passed_data, offer.offer_items.item_id), passed_data.outlet);
                
            console.log('for free');
            console.log(order_value);
            console.log(offer.minimum_bill_value);
            if(order_value >= offer.minimum_bill_value) {
                console.log('offer applicable');
                    offer.is_already_checked = true;
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
            var order_value = calculate_tax(calculate_order_value(passed_data, null), passed_data.outlet);
            offer.is_applicable = false;
            offer.order_value = order_value;    
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
            
            var order_value = calculate_tax(calculate_order_value(passed_data, offer.offer_items.item_id), passed_data.outlet);
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
            var order_value = calculate_tax(calculate_order_value(passed_data, null), passed_data.outlet);
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

    var order_value = calculate_tax(calculate_order_value(passed_data, null), passed_data.outlet);
                
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
    var discount = 0;

    var order_value = calculate_tax(calculate_order_value(passed_data, null), passed_data.outlet);
                
    console.log('for percentage off');
    console.log(order_value);
    console.log(offer.minimum_bill_value);
    if(order_value >= offer.minimum_bill_value) {
        console.log('offer applicable');
        console.log(offer.actions.reward.reward_meta.percent)
        discount = (order_value * offer.actions.reward.reward_meta.percent)/100;
        if(discount <= offer.actions.reward.reward_meta.max) {
            order_value = order_value - (order_value * offer.actions.reward.reward_meta.percent)/100;            
        }
        else {
            order_value = order_value - offer.actions.reward.reward_meta.max;               
        }
        
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

function generate_and_cache_order(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;
    var order_number, order_actual_value;
    var date = new Date();
    var month = date.getMonth();
    var year = date.getFullYear();
    year = year.toString().substr(2,2);

    var code = keygen._({
        forceUppercase: true,
        length: 4,
        exclude: ['O', '0', 'L', '1', 'I']
    });

    order_number = 'TW'+data.outlet.links.short_url+'-'+month+year+'-'+code;
    order_actual_value = calculate_tax(calculate_order_value(passed_data, null), passed_data.outlet);

    var order = {};
    order.order_number = order_number;
    order.items = data.items;
    order.order_actual_value = order_actual_value;     
    order.available_offers = data.outlet.offers;
    data.order = order;
    
    Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
      if(err) {
        logger.log(err);
      }
        deferred.resolve(data)
    });
    return deferred.promise;

}

function apply_selected_offer(data) {
    logger.log();
    var deferred = Q.defer();

    var passed_data = data;
    var applied_offer = {};
    Cache.hget(passed_data.user._id, 'order_map', function(err, reply) {
        if(!reply) {
            deferred.reject('no offer available for user at this outlet')
        }
        else{
            var order = JSON.parse(reply);
            console.log(order);
            if(passed_data.order_number === order.order_number) {
                if(passed_data.used_offer) {                
                    
                    applied_offer = _.find(order.available_offers, function(offer){
                        
                        if(offer && offer.is_applicable && offer._id === passed_data.used_offer) {
                            order.offer_used = offer;
                            order.order_value = offer.order_value;
                            data.order_value = offer.order_value;

                            return order;                        
                        }
                    })
                
                    delete order.available_offers;
                    Cache.hset(data.user._id, "order_map", JSON.stringify(order), function(err) {
                       if(err) {
                         logger.log(err);
                       }
                       else{
                            console.log('order found and offer applied')
                            data.applied_offer = applied_offer;
                            deferred.resolve(data);
                       }
                        
                    });   
                }
                else{
                    console.log('order found and no offer applied')
                    data.order_value = order.order_actual_value;
                    data.applied_offer = null;
                    deferred.resolve(data);
                }
            }
            else {
                console.log('order not found');
                var order_value = calculate_tax(calculate_order_value(passed_data, null), passed_data.outlet);
                data.order_value = order_value;
                data.applied_offer = null;
                deferred.resolve(data);
            }
        } 
    })
    return deferred.promise;
}

function calculate_tax(order_value, outlet) {
    logger.log();
    
    var new_order_value = order_value;
    var tax_grid = {};

    tax_grid = _.find(TaxConfig.tax_grid, function(tax_grid) {        
        if(tax_grid.city.trim() === outlet.contact.location.city.trim()) {
            return tax_grid;
        }
    })
    console.log(tax_grid);
    var new_order_value = 0, vat = 0, surcharge_on_vat = 0, st = 0, sbc = 0,packing_charge = 0;
   
    vat = order_value*tax_grid.vat/100;
    surcharge_on_vat = vat*tax_grid.surcharge_on_vat/100;

    st = ((order_value*tax_grid.st_applied_on_percentage/100)*tax_grid.st)/100;   
    

    sbc = ((order_value*tax_grid.st_applied_on_percentage/100)*tax_grid.sbc)/100; 
    

    if(outlet.attributes.packing_charge) {
        packing_charge = outlet.attributes.packing_charge;
    }
    console.log(vat + ' ' + surcharge_on_vat + ' ' + st + ' ' + sbc + ' ' + packing_charge)
    new_order_value = order_value+vat+surcharge_on_vat+st+sbc+packing_charge;
    vat = vat+surcharge_on_vat;
    st = st+sbc;

    return new_order_value;
}

function massage_offer(data) {
    logger.log();
    var deferred = Q.defer();

    data.outlet.offers = _.map(data.outlet.offers, function(offer) {
      if (offer.type) {
        return offer;
      } 
      else if(offer.offer_status === 'archived' || offer.offer_status === 'draft') {
        return false;
      }
      else {
        var massaged_offer = {};
        massaged_offer.order_value = offer.order_value;
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

        var date = new Date();
        var time = date.getHours()+':'+date.getMinutes();
        date = date.getMonth()+'-'+date.getDate()+'-'+date.getFullYear();

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

        if(massaged_offer.expiry && (new Date(massaged_offer.expiry) <= new Date())) {
          return massaged_offer;
        }
        else{
          return massaged_offer;  
        }       
      }

    });
    deferred.resolve(data);
    return deferred.promise;
}

function massage_order(data){
    logger.log();
    var deferred = Q.defer();

    calculate_order_value()
    deferred.resolve();
    return deferred.promise;
}

module.exports.update_order = function(token, update_order) {
    logger.log();
    var deferred = Q.defer();
    var id = update_order._id;
    AuthHelper.get_user(token).then(function(data) {
      
        Order.findOneAndUpdate({
            _id: id
          }, {
            $set: update_order
          }, {
            upsert: true
          },
          function(err, o) {
            if (err || !o) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t update the order'
              });
            } else {
              updated_outlet._id = id;

              deferred.resolve({
                data: o,
                message: 'Updated order successfully'
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

module.exports.cancel_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();

    var id = order._id;
    AuthHelper.get_user(token).then(function(data) {
      
        Order.findOneAndUpdate({
            _id: id
          }, {
            $set: order
          }, {
            upsert: true
          },
          function(err, o) {
            if (err || !o) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t cancel the order'
              });
            } else {
              order._id = id;

              deferred.resolve({
                data: o,
                message: 'order cancelled successfully'
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
