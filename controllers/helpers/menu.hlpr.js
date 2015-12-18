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
var AWSHelper = require('./aws.hlpr.js');
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
                    if (err || !outlet) {
                        deferred.reject({
                            err: err || true,
                            message: "Couldn't add the menu"
                        })
                    } else {
                        outlet.menus = outlet.menus || [];
                        outlet.menus.push(menu);
                        logger.log(outlet);
                        outlet.save(function(err) {
                            if (err) {
                                console.log(err);
                                // logger.error(err);
                            }
                        });

                        var outlets = JSON.parse(reply);

                        if (outlets[menu.outlet.toString()]) {
                            if (!outlets[menu.outlet.toString()].menus) {
                                outlets[menu.outlet.toString()].menus = [];
                            }
                            outlets[menu.outlet.toString()].menus.push(menu);
                        }

                        Cache.set('outlets', JSON.stringify(outlets), function(err) {
                            if (err) {
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
            if (err || !outlet) {
                console.log(err)
                deferred.reject({
                    err: err,
                    message: 'Unable to load menu details'
                })
            } else {
                outlet = outlet.toJSON();
                var menu = _.filter(outlet.menus, function(menu) {
                    return menu._id.toString() === menuId;
                });
                if (menu.length) {
                    menu = _.clone(menu[0]);
                    menu.outlet = outlet._id;
                    deferred.resolve({
                        data: menu,
                        message: 'menu found'
                    });
                } else {
                    deferred.reject({
                        err: null,
                        message: 'Unable to load menu details'
                    });
                }
            }
        })
    return deferred.promise;
}

module.exports.update_menu = function(token, updated_menu, menu_id) {
    logger.log();
    var deferred = Q.defer();
    var old_outlet;
    Outlet.update({
        'menus._id': updated_menu._id
    }, {
        $set: {
            'menus.$': updated_menu
        }
    }).exec(function(err) {
        if (err) {
            deferred.reject({
                err: err || false,
                message: 'Failed to update menu'
            });
        } else {
            Cache.get('outlets', function(err, reply) {
                if (err || !reply) {
                    deferred.reject({
                        err: err || false,
                        message: 'Could not find outlets'
                    });
                } else {
                    var outlets = JSON.parse(reply);
                    if (outlets[updated_menu.outlet] && outlets[updated_menu.outlet].menus) {
                        _.each(outlets[updated_menu.outlet].menus, function(menu) {
                            if (menu._id == updated_menu._id) {
                                menu = _.extend(menu, updated_menu);
                            }
                        });
                        Cache.set('outlets', JSON.stringify(outlets));
                    }
                    deferred.resolve({
                        data: updated_menu,
                        message: 'Successfully added the menu'
                    });
                }
            });
        }
    });
    return deferred.promise;
}

var _updateCache = function(updated_outlet) {
    Cache.get('outlets', function(err, reply) {
        if (err) {
            logger.error("Error retrieving outlets for updating");
        } else {
            var outlets = [];
            if (reply) {
                outlets = JSON.parse(reply);
            }
            async.each(updated_outlet, function(outlet, callback) {
                outlets[outlet._id.toString()] = outlet;
                callback();
            }, function(err) {
                Cache.set('outlets', JSON.stringify(outlets), function(err) {
                    if (err) {
                        logger.error("Error updating outlets");
                    }
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
        if (err || !outlets) {
            deferred.reject({
                err: err || true,
                message: 'Failed to update menu'
            });
        } else {
            async.each(outlets, function(outlet, callback) {
                var index = _.findIndex(outlet.menus, function(menu) {
                    return menu._id.toString() == menuId;
                });
                if (index !== -1) {
                    outlet.menus.splice(index, 1);
                    outlet.save(function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    });
                    Cache.get('outlets', function(err, reply) {
                        if (err || !reply) {
                            logger.error(err);
                        } else {
                            var outlets = JSON.parse(reply);
                            if (outlets[outlet._id] && outlets[outlet._id].menus) {
                                outlets[outlet._id].menus = _.compact(_.each(outlets[outlet._id].menus, function(menu) {
                                    return menu._id.toString() !== menuId;
                                }));
                                Cache.set('outlets', JSON.stringify(outlets));
                            }
                        }
                    })
                } else {
                    callback();
                }
            }, function(err) {
                if (err) {
                    deferred.reject({
                        err: err || true,
                        message: 'An error occured while deleting menu'
                    });
                } else {
                    _updateCache(outlets);
                    deferred.resolve({
                        data: {},
                        message: 'menu deleted successfully'
                    });
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
        if (user.role >= 6) {
            deferred.reject({
                err: false,
                message: 'Unauthorized access'
            });
        } else {
            Cache.get('outlets', function(err, reply) {
                if (err || !reply) {
                    deferred.reject({
                        err: false,
                        message: 'Unable to load menus right now'
                    });
                } else {
                    var menu_ids = [];
                    var menus = [];
                    var outlets = JSON.parse(reply);
                    async.each(user.outlets, function(outlet_id, callback) {
                        if (outlets[outlet_id] && outlets[outlet_id].menus) {
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
    logger.log(menu_id, outlet_id);
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
            outlet = outlet.toJSON();
            var menu = _.filter(outlet.menus, function(menu) {
                return menu._id.toString() === menu_id;
            });

            if (menu.length) {
                var original_menu = menu[0]._id;
                menu = _.clone(menu[0]);
                menu._id = new ObjectId();
                clone_item_images(menu, original_menu).then(function() {
                    Outlet.findOneAndUpdate({
                        _id: outlet_id
                    }, {
                        $push: {
                            'menus': menu
                        }
                    }).exec(function(err) {
                        if (err) {
                            deferred.reject({
                                err: false,
                                message: 'Unable to find the menu'
                            })
                        } else {
                            Cache.get('outlets', function(err, reply) {
                                if (err || !reply) {
                                    logger.error(err);
                                } else {
                                    var outlets = JSON.parse(reply);
                                    
                                    if (outlets[outlet_id]) {
                                        outlets[outlet_id].menus = outlets[outlet_id].menus || [];
                                        outlets[outlet_id].menus.push(menu);
                                        Cache.set('outlets', JSON.stringify(outlets));
                                    }
                                }
                            });
                            deferred.resolve({
                                data: {},
                                message: 'Menu cloned successfully'
                            });
                        }
                    });
                });

            } else {
                deferred.reject({
                    err: false,
                    message: 'Unable to find the menu'
                });
            }
        }
    });

    function clone_item_images(menu, original_menu_id) {
        logger.log('cloning', menu);
        var deferred = Q.defer();
        async.each(menu.menu_categories, function(category, callback) {
            async.each(category.sub_categories, function(sub_category, callback) {
                async.each(sub_category.items, function(item, callback) {
                    if (item.item_photo) {
                        var img_obj = {
                            Bucket: 'retwyst-merchants',
                            ACL: 'public-read',
                            CopySource: 'retwyst-merchants/retwyst-menus/' + original_menu_id + '/' + item.item_photo,
                            Key: 'retwyst-menus/' + menu._id + '/' + item.item_photo
                        };
                        logger.info(img_obj);
                        AWSHelper.cloneImage(img_obj).then(function(res) {
                            logger.error('res', res);
                            callback();
                        }, function(err) {
                            logger.error('error', err);
                            callback();
                        });
                    } else {
                        callback();
                    }
                }, function() {
                    callback();
                });
            }, function() {
                callback();
            });
        }, function() {
            deferred.resolve();
        });
        return deferred.promise;
    };

    return deferred.promise;
}
