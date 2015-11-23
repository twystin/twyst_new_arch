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
                Outlet.findById(menu.outlet).exec(function(err, outlet) {
                    if(err || !outlet) {
                        deferred.reject({
                            err: err || true,
                            message: "Couldn't add the menu"
                        })
                    } else {
                        outlet.menus = outlet.menus || [];
                        outlet.menus.push(menu);
                        logger.log(outlet);
                        outlet.save(function(err) {
                            if(err) {
                                console.log(err);
                                // logger.error(err);
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
            outlet = outlet.toJSON();
            var menu = _.filter(outlet.menus, function(menu) {
                logger.error(menu._id.toString() === menuId);
                return menu._id.toString() === menuId;
            });
            if(menu.length) {
                menu = _.clone(menu[0]);
                menu.outlet = outlet._id;
                deferred.resolve({data: menu, message: 'menu found'});
            } else {
                deferred.reject({ err: null, message: 'Unable to load menu details'});
            }
        }
    })
    return deferred.promise;
}

module.exports.update_menu = function(token, updated_menu, menu_id) {
    logger.log();
    var deferred = Q.defer();
    var old_outlet;
    Outlet.findOne({
        'menus._id': menu_id
    }).exec(function(err, outlet) {
        if(err || !outlet) {
            deferred.reject({
                err: err || true,
                message: 'Failed to update menu'
            })
        } else {
            for (var i=0; i<outlet.menus.length; i++) {
                if(outlet.menus[i]._id.toString() === menu_id) {
                    outlet.menus.splice(i, 1);
                }
            }
            outlet.save(function(err) {
                logger.error(err);
            });
            old_outlet = outlet._id.toString();
            Outlet.findById(updated_menu.outlet).exec(function(err, outlet) {
                if(err || !outlet) {
                    deferred.reject({
                        err: err || true,
                        message: "Couldn't add the menu"
                    })
                } else {
                    outlet.menus = outlet.menus || [];
                    outlet.menus.push(updated_menu);
                    outlet.save(function(err) {
                        if(err) {
                            logger.error(err);
                        }
                    });
                    Cache.get('outlets', function(err, reply) {
                        if (err || !reply) {
                            deferred.reject('Could not find outlets');
                        } else {
                            var outlets = JSON.parse(reply);
                        
                            if(outlets[old_outlet] && outlets[old_outlet].menus) {
                                outlets[old_outlet].menus = _.compact(_.map(outlets[old_outlet].menus, function(menu) {
                                    return menu._id.toString() !== updated_menu._id;
                                }));
                                outlets[updated_menu.outlet.toString()].menus = outlets[updated_menu.outlet.toString()].menus || [];
                                outlets[updated_menu.outlet.toString()].menus.push(updated_menu);
                            } else {
                                outlets[updated_menu.outlet.toString()].menus = outlets[updated_menu.outlet.toString()].menus || [];
                                outlets[updated_menu.outlet.toString()].menus.push(updated_menu);
                            }
                            Cache.set('outlets', JSON.stringify(outlets), function(err) {
                                if(err) {
                                    logger.error("Error setting outlets ", err);
                                }
                            });
                            
                            deferred.resolve({
                                data: updated_menu,
                                message: 'Successfully added the menu'
                            });
                        }
                    });
                }
            })
        }
    })
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
    AuthHelper.get_user(token).then(function(data) {
        var user = data.data;
        if(user.role >= 6) {
            deferred.reject({
                err: false,
                message: 'Unauthorized access'
            });
        } else {
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
                    async.each(user.outlets, function(outlet_id, callback) {
                        if(outlets[outlet_id] && outlets[outlet_id].menus) {
                            var menu_set = _.map(outlets[outlet_id].menus, function(menu_obj) {
                                menu_obj.outlet = {
                                    _id: outlet_id,
                                    name: outlets[outlet_id].basics.name,
                                    loc1: outlets[outlet_id].contact.location.locality_1[0],
                                    loc2: outlets[outlet_id].contact.location.locality_2[0]
                                };
                                return menu_obj;
                            });
                            menus = menus.concat(menu_set);
                            callback();
                        } else {
                            callback();
                        }
                    }, function() {
                        deferred.resolve({
                            data: menus,
                            message: 'Menus loaded successfully'
                        })
                    });
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

module.exports.clone_menu = function(menu_id, outlet_id) {
    logger.log();
    var deferred = Q.defer();
    Outlet.findOne({
        'menus._id': menu_id
    }).exec(function(err, outlet) {
        if (err || !outlet) {
            deferred.reject({
                err: false,
                message: 'Unable to find the menu'
            });
        } else {
            var menu = _.filter(outlet.menus, function(menu) {
                return menu._id.toString() === menu_id;
            });

            if(menu.length) {
                menu = _.clone(menu[0]);
                menu._id = new ObjectId();
                Outlet.findOneAndUpdate({
                    _id: ObjectId(outlet_id)
                }, {
                    $push: {
                        'menus': menu
                    }
                }).exec(function(err) {
                    if(err) {
                        deferred.reject({
                            err: false,
                            message: 'Unable to find the menu'
                        })
                    } else {
                        Cache.get('outlets', function(err, reply) {
                            if(err || !reply) {
                                logger.error(err);
                            } else {
                                var outlets = JSON.parse(reply);
                                outlets[outlet_id].menus = outlets[outlet_id].menus || [];
                                outlets[outlet_id].menus.push(menu);
                                Cache.set('outlets', JSON.stringify(outlets));
                                deferred.resolve({
                                    data: menu,
                                    message: 'Menu cloned successfully'
                                });
                            }
                        });
                    }
                });
            } else {
                deferred.reject({
                    err: false,
                    message: 'Unable to find the menu'
                });
            }
        }
    });
    return deferred.promise;
}