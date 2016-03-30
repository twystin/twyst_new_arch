'use strict';
/*jslint node: true */

var Q = require('q');
var _ = require('underscore');
var ld = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var User = mongoose.model('User');
var Friend = mongoose.model('Friend');
var Contact = mongoose.model('Contact');
var Order = mongoose.model('Order');
var Event = mongoose.model('Event');
var Keygenerator      = require('keygenerator');
var async = require('async');
var request = require('request');
var AuthHelper = require('../../common/auth.hlpr.js');
var logger = require('tracer').colorConsole();
var MobikwikPaymentHelper = require('./mobikwik_payment.hlpr.js');
var Transporter = require('../../transports/transporter.js');
var GetTemplatePath = require('../../common/getTemplatePath.cfg.js');
var MailContent       = require('../../common/template.hlpr.js');
var PayloadDescriptor = require('../../common/email.hlpr.js');
var sender = "info@twyst.in";

module.exports.update_user = function(token, updated_user) {
  logger.log();
  var deferred = Q.defer();
  AuthHelper.get_user(token).then(function(data) {
    var user = data.data;
    user = ld.merge(user, updated_user);
    /*if(!user.validation.is_verification_mail_sent){
      user.validation.verification_mail_token = Keygenerator.session_id();
      var filler = {
        "name":user.first_name,
        "link": 'http://twyst.in/verify/email/' + user.validation.verification_mail_token
      };
      var email = user.email || user.profile.email || null;
      MailContent.templateToStr(GetTemplatePath.byName('email_verification_mail.hbs'), filler, function(mailStr){
        var payloadDescriptor = new PayloadDescriptor('utf-8', user.email, 'Verify your account!', mailStr, sender);
        Transporter.send('email', 'ses', payloadDescriptor);
      });
      user.validation.is_verification_mail_sent = true;
    }*/

    if(user.gcmId) {
        var index = ld.findIndex(user.push_ids, function(push) { return push.push_id==user.gcmId; });
        if(index==-1) {
          var push_info = {
              push_type: 'gcm',
              push_id: user.gcmId,
              push_meta: {}

          };
          user.push_ids.push(push_info);
        }
    }
    if(user.lat && user.long) {
        user.locations = {};
        user.locations.coords ={};
        user.locations.coords.lat = user.lat;
        user.locations.coords.log = user.long;
        user.locations.when = new Date();
    }

    if(user.source) {
      user[updated_user.source.toLowerCase()] = updated_user;
    }

    user.device_info = {
        id: user.device,
        os: user.os_version,
        model: user.model
    }
    user.friends = user.friends_id;

    delete user.os_version;
    delete user.model;
    delete user.gcmId;
    delete user.lat;
    delete user.long;
    delete user.__v;
    delete user.friends._id;

    User.findOneAndUpdate({
      _id: user._id
    }, {
      $set: user
    }, {
      upsert: true
    }).exec(function(err, u) {
      if (err || !u) {
        console.log(err);
        deferred.reject({
          err: err || true,
          message: "Couldn\'t update user"
        });
      } else {
        deferred.resolve({
          data: u,
          message: 'Updated user'
        });
      }
    });
  }, function(err) {
    deferred.reject({
      err: err || true,
      message: "Couldn\'t find user"
    });
  });

  return deferred.promise;
};

module.exports.update_friends = function(token, friend_list) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        var obj = {};
        var friend = [];
        _.each(friend_list.list, function(user_friend){
            if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {

            obj.social_id = friend.id;
            obj.email = user_friend.email;
            obj.phone = user_friend.phone;
            obj.name = user_friend.name;
            obj.add_date = new Date();

            }
            else {

                obj.phone = user_friend.phone;
                obj.name = user_friend.name;
                obj.add_date = new Date();

            }
            friend.push(obj);
        })
        var contact = new Contact();
        contact.friends = friend;
        contact.user = user._id;
        contact.save(function(err) {
            if(err) {
                logger.error(err);
                deferred.reject({
                        data: err,
                        message: 'error in updating user'
                    });
            }
            else {
                deferred.resolve({
                    data: user,
                    message: 'Updated user'
                });
            }
        });
        //var update_query = { $pushAll: { friends: [] } };
        /*async.each(friend_list.list, function(friend, callback) {
            var index;
            if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {
                index = _.findIndex(user.friends, function(existing_friend) { return existing_friend.social_id == friend.id; });
            }
            else {
                index = _.findIndex(user.friends, function(existing_friend) { return existing_friend.phone == friend.phone; });
            }
            if (index === -1) {
                var friend_obj = {
                    source: friend_list.source,
                    add_date: new Date(),
                    phone: '',
                    social_id: '',
                    name: friend.name,
                    email: friend.email
                };

                var user_obj = {
                    source: friend_list.source,
                    add_date: new Date(),
                    phone: user.phone,
                    social_id: '',
                    email: user.email,
                    user: user._id,
                    name: user.first_name,
                    gcm_id: user.push_ids[user.push_ids.length - 1].push_id
                };

                if (friend_list.source === 'GOOGLE' || friend_list.source === 'FACEBOOK') {
                    friend_obj.social_id = friend.id;

                    findFriendBySourceId(friend.id).then(function(app_friend) {
                        if (app_friend) {
                            friend_obj.user = app_friend.id;
                            friend_obj.email = app_friend.email;
                            friend_obj.phone = app_friend.phone;
                            addUserReferral(user_obj, app_friend.friends);
                            friend_obj.gcm_id = app_friend.gcm_id;
                        }
                        update_query['$pushAll'].friends.push(friend_obj);
                        callback();
                    })

                }
                else {
                    friend_obj.phone = friend.phone;

                    findFriendBySourceId(friend.phone).then(function(app_friend) {
                        if (app_friend) {
                            friend_obj.user = app_friend.id;
                            friend_obj.email = app_friend.email;
                            addUserReferral(user_obj, app_friend.friends);
                            friend_obj.gcm_id = app_friend.gcm_id;
                        }
                        update_query['$pushAll'].friends.push(friend_obj);
                        callback();
                    })

                }
            }
            else {
                callback();
            }
        },
        function() {
            Friend.findOneAndUpdate({'_id': user.friends_id}, update_query, function(err, u) {
                if (err || !u) {
                    deferred.reject({
                        err: err || true,
                        message: "Couldn\'t update user"
                    });
                }
                else {
                    deferred.resolve({
                        data: u,
                        message: 'Updated user'
                    });
                }
            });
        }*/
    }, function(err) {
        deferred.reject({
          err: err || true,
          message: "Couldn\'t find user"
        });
    });

    return deferred.promise;
};

function findFriendBySourceId(friendId) {
  logger.log();
  var deferred = Q.defer();
  User.findOne({ $or: [{ 'facebook.id': friendId }, { 'google.id': friendId }, {phone: friendId}] }).exec(function(err, friend) {
    if (err || !friend) {
      deferred.resolve();
    } else {
      var push_id = null;
      if(friend.push_ids.length) {
        push_id = friend.push_ids[friend.push_ids.length - 1].push_id
      } else {
        push_id = '';
      }
      deferred.resolve({
        id: friend._id.toString(),
        email: friend.email,
        phone: friend.phone,
        friends: friend.friends,
        gcm_id: push_id
      });
    }
  });
  return deferred.promise;
}

function addUserReferral(user_obj, friendObjId) {
    logger.log();
    Friend.findOne({'_id': ObjectId(friendObjId)}).exec(function(err, obj) {
        if(err || !obj) {

        }
        else {
            var index = _.findIndex(obj.friends, function(friend) {
                return friend.phone == user_obj.phone;
            });
            if(index == -1) {
                obj.friends.push(user_obj);
            }
            else {
                obj.friends[index].user = user_obj.user.toString();
            }
            obj.save(function(err) {
                if(err) {
                    logger.error(err);
                }
                else {
                    logger.log('referral added successfully');
                }
            });
        }
    });
}

module.exports.cancel_order = function(token, order) {
    logger.log();
    var deferred = Q.defer();
    console.log(order);
    var data = {};
    data.user_token = token;
    data.order = order;

    get_user(data)
    .then(function(data) {
        return update_order_status(data);
    })
    .then(function(data) {
        return initiate_refund(data);
    })
    .then(function(data) {
        return send_notification_to_all(data);
    })
    .then(function(data) {
        return send_sms(data);
    })
    //.then(function(data) {
        //return /*(data);
    //})
    .then(function(data) {
        return update_user_twyst_cash(data.order);
    })
    .then(function(data) {
        return save_order_cancel_event(data);
    })
    .then(function(data) {
        deferred.resolve(data);
    })
    .fail(function(err) {
        console.log('we are here in error');
      deferred.reject(err);
    });
    return deferred.promise;
};

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

function update_order_status(data) {
    logger.log();
    var deferred = Q.defer();

    var current_action = {};
    current_action.action_type = 'CANCELLED';
    current_action.action_by = data.user._id;
    console.log(data.order);

    Order.findOne({
        _id: data.order.order_id
      }).populate('outlet').exec(function(err, order) {
        if (err || !order) {
          deferred.reject({
            err: err || true,
            message: 'Couldn\'t find this order'
          });
        } else {
            if(order.order_status === 'PENDING') {
                order.order_status = 'CANCELLED';
                order.actions.push(current_action);
                order.save(function(err, order){
                    if(err || !order){
                        deferred.reject({
                            err: err || true,
                            message: 'Couldn\'t cancel this order'
                        });
                    }
                    else{
                        data.order = order;
                        deferred.resolve(data);
                    }
                })
            }
            else{
                deferred.reject({
                    err: err || true,
                    message: 'Couldn\'t cancel this order'
                });
            }

        }
      }
    );
    return deferred.promise;
}

function initiate_refund(data){
    logger.log();
    var deferred = Q.defer();

    if(data.order.payment_info.is_inapp) {
        console.log('inapp payment process refund '+data.order.payment_info.payment_mode);
        if(data.order.payment_info.payment_mode === 'Zaakpay')  {
            data.order.refund_mode = 'Zaakpay';
            data.order.updateDesired = 14;
            data.order.updateReason = 'user has cancelled order';
        }
        else if(data.order.payment_info.payment_mode === 'wallet') {
            data.order.refund_mode = 'wallet';
            data.order.refund_type = 'full_refund';
        }
        else{
            console.log('unknown payment mode');
            deferred.resolve(data);
        }
        MobikwikPaymentHelper.process_refund(data.order).then(function (data) {
            deferred.resolve(data);
        }, function(err) {
            deferred.reject({
              err: err || true,
              message: "could not proces refund right now"
            });
        });
    }
    else{
        console.log('cod payment no refund');
        deferred.resolve(data);
    }
    return deferred.promise;
}

function send_notification_to_all(data) {
    logger.log();
    var deferred = Q.defer();

    send_notification(['console', data.order.outlet.basics.account_mgr_email.replace('.', '').replace('@', ''),
        data.order.outlet._id], {
        message: 'User has cancelled an order',
        order_id: data.order_id,
        type: 'cancelled'
    });

    deferred.resolve(data);
    return deferred.promise;

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

function send_sms(data) {
    logger.log();
    var deferred = Q.defer();

    var payload  = {}
    payload.from = 'TWYSTR';
    payload.message = '';
    var items, collected_amount;
    if(data.user.profile && data.user.profile.first_name) {
        var name = 'Name: '+ data.user.profile.first_name;
    }
    else{
        var name = 'Name: '+ data.user.first_name;
    }

    var phone = ' Phone: '+ data.user.phone;
    var order_number = ' Order Number: ' + data.order.order_number;
    var total_amount = ' Total Amount: Rs '+ data.order.actual_amount_paid ;

    payload.message = 'Order Cancelled ' + order_number + name  + phone + 'Order Details: ';

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

    payload.message = payload.message +total_amount;
    payload.message = payload.message.toString();
    console.log(payload.message);

    data.order.outlet.contact.phones.reg_mobile.forEach(function (phone) {
        if(phone && phone.num) {
            payload.phone = phone.num;
            Transporter.send('sms', 'vf', payload);
        }
    });

    deferred.resolve(data);
    return deferred.promise;
}

function send_email(data) {
    logger.log();
    var deferred = Q.defer();

    var items ='', collected_amount,account_mgr_email, merchant_email;
    if(data.user.profile && data.user.profile.first_name) {
        var name = ' Name: '+ data.user.profile.first_name;
    }
    else{
        var name = ' Name: '+ data.user.first_name;
    }
    var phone = 'Phone: '+ data.user.phone;

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

            items = items + '\n' + quantity + ' * ' + item_name + ': Rs '+ final_cost;

        }

    };

    var order_number = ' Order Number: ' + data.order_number;
    var total_amount = ' Total Amount: Rs '+ data.order.actual_amount_paid ;

    if(data.order.outlet.basics.account_mgr_email) {
        account_mgr_email = data.order.outlet.basics.account_mgr_email
    }
    else{
        account_mgr_email = 'kuldeep@twyst.in';
    }

    if(data.order.outlet.contact.emails.email) {
        merchant_email = data.order.outlet.contact.emails.email;
    }

    else{
        merchant_email = 'kuldeep@twyst.in'
    }
    var payload = {
        Destination: {
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [ account_mgr_email] //, merchant_email
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Data:
                    "<h4>Outlet</h4>" + data.order.outlet.basics.name +
                    "<h4>Order Number</h4>" + data.order.order_number +
                    "<h4>Name</h4>" + name
                    + "<h4>Phone</h4>" + phone
                    + "<h4>Items</h4>" + items
                    + "<h4>Total Cost</h4>" + total_amount
                    + "<h4>Payment Method </h4>" + data.order.payment_mode

                },
                Text: {
                    Data: 'Order Cancelled'

                }
            },
            Subject: { /* required */
              Data: 'Order Cancelled' + data.order.order_number, /* required */

            }
        },
        Source: 'info@twyst.in',
        ReturnPath: 'info@twyst.in'
    };

    Transporter.send('email', 'ses', payload).then(function(reply) {
        deferred.resolve(data);
    }, function(err) {
        console.log('mail failed', err);
        console.log('getting error here')
        deferred.reject(data);
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
        if (item.option.option_is_addon === true || item.option_price_is_additive === true) {
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

module.exports.get_twyst_cash_history = function(token) {
    logger.log();
    var deferred = Q.defer();

    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        Event.find({event_user: user._id}).populate('event_outlet').exec(function(err, events) {
            if (err || !events) {
              deferred.reject({
                err: err || true,
                message: 'Couldn\'t find this order'
              });
            }
            else {
                var order_history = [];
                var history = {};
                _.each(events, function(event){
                    if(event.event_type === 'order_feedback'
                    && event.event_meta && event.event_meta.twyst_cash > 0) {

                        var action = {};
                        action.type = 'order';
                        action.earn =  true;
                        action.twyst_cash = event.event_meta.twyst_cash;
                        action.earn_at = event.event_date;
                        var percentage = (100*event.event_meta.twyst_cash/event.event_meta.amount).toFixed(2);
                        action.message = 'Order at '+ event.event_outlet.basics.name + " Worth Rs. "
                         + event.event_meta.amount + "+tax, earned " + percentage +"% Twyst Cash";
                        action.outlet = event.event_outlet.basics.name;
                        order_history.push(action);
                    }
                    else if(event.event_type === 'cancel_order'
                        && event.event_meta && event.event_meta.twyst_cash >0) {
                        var action = {};
                        action.type = 'cancel order';
                        action.earn =  true;
                        action.twyst_cash = event.event_meta.twyst_cash;
                        action.earn_at = event.event_date;
                        action.message = 'Refund against order cancellation at '+ event.event_outlet.basics.name;
                        action.outlet = event.event_outlet.basics.name;
                        order_history.push(action);
                    }
                    else if(event.event_type === 'recharge_phone'
                        && event.event_meta && event.event_meta.twyst_cash >0) {
                        var action = {};
                        action.type = 'recharge_phone';
                        action.earn =  false;
                        action.twyst_cash = event.event_meta.twyst_cash;
                        action.earn_at = event.event_date;
                        action.message = 'Mobile recharge for ' + event.event_meta.phone;
                        order_history.push(action);
                    }
                    else if(event.event_type === 'use_shopping_offer'
                        && event.event_meta && event.event_meta.twyst_cash >0) {
                        var action = {};
                        action.type = 'use_shopping_offer';
                        action.earn =  false;
                        action.twyst_cash = event.event_meta.twyst_cash;
                        action.earn_at = event.event_date;
                        action.message = event.event_meta.source + " Voucher Redeemed";                        
                        order_history.push(action);
                    }
                    else if(event.event_type === 'use_food_offer'
                        && event.event_meta && event.event_meta.twyst_cash >0) {
                        var action = {};
                        action.type = 'use_food_offer';
                        action.earn =  false;
                        action.twyst_cash = event.event_meta.twyst_cash;
                        action.earn_at = event.event_date;
                        action.message = 'Offer used at ' + event.event_outlet.basics.name;
                        action.outlet = event.event_outlet.basics.name;
                        order_history.push(action);
                    }
                })
                history.twyst_cash = user.twyst_cash;
                history.twyst_cash_history = order_history;
                deferred.resolve({
                    message: 'returning twyst cash history',
                    data: history
                });

            }
        })
    }, function(err) {
        deferred.reject({
            err: err || true,
            message: "Couldn\'t find user"
        });
    });
    return deferred.promise;
};

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
        user.twyst_cash = user.twyst_cash+order.offer_cost;

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

function save_order_cancel_event(order) {
    logger.log();
    var deferred = Q.defer();

    if(order.offer_used) {
        var event = {};
        event.event_meta = {};
        event.event_meta.order_number = order.order_number;
        event.event_meta.amount = order.actual_amount_paid;
        event.event_meta.twyst_cash = order.offer_cost;
        event.event_meta.offer = order.offer_used;

        event.event_user = order.user;
        event.event_type = 'cancel_order';

        event.event_outlet = order.outlet;
        event.event_date =  new Date();
        var created_event = new Event(event);
        created_event.save(function(err, e) {
            if (err || !e) {
                deferred.reject('Could not save the event - ' + JSON.stringify(err));
            } else {
                deferred.resolve(order);
            }
        });
    }
    else{
        deferred.resolve(order);
    }
    return deferred.promise;
}
