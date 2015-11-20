'use strict';
/*jslint node: true */

var Cache = require('../../common/cache.hlpr');
var Q = require('q');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Outlet = mongoose.model('Outlet');
var logger = require('tracer').colorConsole();
var AuthHelper = require('../../common/auth.hlpr');
var Cache = require('../../common/cache.hlpr.js');

module.exports.create_menu = function(token, new_menu) {
    logger.log();
    var deferred = Q.defer();
    var menu = {};
    menu = _.extend(menu, new_menu);
    menu._id = new ObjectId();

    AuthHelper.get_user(token).then(function(data) {
        Cache.get('outlets', function(err, reply) {
            if (err || !reply) {
                deferred.reject('Could not find outlets');
            } else {
                Outlet.find({
                    _id:  menu.outlet
                }).exec(function(err, outlet) {
                    if(err || !outlet) {
                        deferred.reject({
                            err: err || true,
                            message: "Couldn't add the menu"
                        })
                    } else {
                        
                        outlet.menus.push(menu);
                        outlet.save(function(err) {
                            if(err) {
                                logger.error(err);
                            }
                        });
                        
                        var outlets = JSON.parse(reply);
                        
                        if(outlets[menu.outlet.toString()]) {
                            if (!outlets[menu.outlet.toString()].menus) {
                                outlets[menu.outlet.toString()].menus = [];
                            }
                            outlets[menu.outlet.toString()].menus.push(menu);
                        }
                        
                        Cache.set('outlets', JSON.stringify(outlets), function(err) {
                            if(err) {
                                logger.error("Error setting outlets ", err);
                            }
                        });
                        deferred.resolve({
                            data: menu,
                            message: 'Successfully added the menu'
                        });
                    }
                });
            }
        });
    });

    return deferred.promise;
}

module.exports.get_menu = function(token, menuId) {
    logger.log();
    var deferred = Q.defer();
    Outlet.findOne({
        'menus._id': menuId
    })
    .exec(function(err, outlet) {
        if(err || !outlet) {
            deferred.reject({
                err: err,
                message: 'Unable to load menu details'
            })
        } else {
            var menu = _.filter(outlet.menus, function(menu) {
                return menu._id.toString() === menuId;
            });
            if(menu.length) {
                deferred.resolve({data: menu[0], message: 'menu found'});
            } else {
                deferred.reject({ err: null, message: 'Unable to load menu details'});
            }
        }
    })
    return deferred.promise;
}

module.exports.update_menu = function(token, new_menu) {
    logger.log();
    var deferred = Q.defer();
    new_menu._id = ObjectId(new_menu._id);
    var outletIds = _.map(new_menu.menu_outlets, function(obj) { return ObjectId(obj); });
    Outlet.find({
        $or: [{
            '_id': {$in: outletIds}
        }, {
            'menus._id': new_menu._id
        }]
    }).exec(function(err, outlets) {
        if(err || !outlets) {
            deferred.reject({err: err || true, message: 'Failed to update menu'});
        } else {
            async.each(outlets, function(outlet, callback) {
                if(new_menu.menu_outlets.indexOf(outlet._id.toString())===-1) {
                    var index = _.findIndex(outlet.menus, function(menu) { return menu._id.toString() == new_menu._id.toString(); });
                    if(index!==-1) {
                        outlet.menus.splice(index, 1);
                        outlet.save(function(err) {
                            if(err) {
                                callback(err)
                            } else {
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }
                } else {
                    var menu = _.findWhere(outlet.menus, {_id: new_menu._id});
                    if(!menu) {
                        outlet.menus.push(new_menu);
                    } else {
                        menu = _.merge(menu, new_menu); 
                        menu.menu_outlets = new_menu.menu_outlets;
                    }
                    outlet.save(function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    })
                }
            }, function(err) {
                if(err) {
                    deferred.reject({err: err || true, message: 'Failed to update menu'});
                } else {
                    _updateCache(outlets);
                    deferred.resolve({data: new_menu, message: "menu updated successfully"});
                }
            });
        }
    });
    return deferred.promise;
}

var _updateCache = function(updated_outlet) {
    Cache.get('outlets', function(err, reply) {
        if(err) {
            logger.error("Error retrieving outlets for updating");
        } else {
            var outlets = [];
            if(reply) {
                outlets = JSON.parse(reply);
            }
            async.each(updated_outlet, function(outlet, callback) {
                outlets[outlet._id.toString()] = outlet;
                callback();
            }, function(err) {
                Cache.set('outlets', JSON.stringify(outlets), function(err) {
                    if(err) { logger.error("Error updating outlets"); }
                });
            });
        }
    });
}

module.exports.delete_menu = function(token, menuId) {
    logger.log();
    var deferred = Q.defer();
    Outlet.find({
        'menus._id': ObjectId(menuId)
    }).exec(function(err, outlets) {
        if(err || !outlets) {
            deferred.reject({err: err || true, message: 'Failed to update menu'});
        } else {
            async.each(outlets, function(outlet, callback) {
                var index = _.findIndex(outlet.menus, function(menu) { return menu._id.toString()==menuId; });
                if(index!==-1) {
                    outlet.menus.splice(index, 1);
                    outlet.save(function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            }, function(err) {
                if(err) {
                    deferred.reject({err: err || true, message: 'An error occured while deleting menu'});
                } else {
                    _updateCache(outlets);
                    deferred.resolve({data: {}, message: 'menu deleted successfully'});
                }
            });
        }
    });
    return deferred.promise;
}

module.exports.get_all_menus = function(token) {
    logger.log();
    var deferred = Q.defer();
    Cache.get('outlets', function(err, reply) {
        if(err || !reply) {
            deferred.reject({
                err: false,
                message: 'Unable to load menus right now'
            });
        } else {
            var menu_ids = [];
            var menus = [];
            var outlets = JSON.parse(reply);
            _.each(outlets, function(outlet) {
                _.each(outlet.menus, function(menu) {
                    if(menu_ids.indexOf(menu._id.toString())===-1) {
                        menu_ids.push(menu._id.toString());
                        menu.outlet = {
                            _id: outlet._id,
                            name: outlet.basics.name,
                            loc1: outlet.contact.location.locality_1[0],
                            loc2: outlet.contact.location.locality_2[0]
                        };
                        menus.push(menu);
                    }
                });
            });
            deferred.resolve({
                data: menus,
                message: 'All menus loaded from server'
            });
        }
    });
    return deferred.promise;
}