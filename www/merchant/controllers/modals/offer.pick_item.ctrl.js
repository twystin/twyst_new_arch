angular.module('merchantApp')
    .controller('PickItemController', function($scope, $modalInstance, merchantRESTSvc, SweetAlert) {
        $scope.all_menus = [];

        $scope.menu_set = {};
        $scope.category_set = {};
        $scope.sub_category_set = {};
        $scope.item_set = {};
        $scope.option_set = {};
        $scope.sub_option_sets = {};
        $scope.addon_sets = {};

        $scope.menus = [];
        $scope.categories = [];
        $scope.sub_categories = [];
        $scope.items = [];
        $scope.options = [];
        $scope.sub_options = [];
        $scope.addons = [];

        $scope.$watchCollection('menu_set', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.menus = [];
            $scope.menus = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('menus', $scope.menus);
        });

        $scope.$watchCollection('category_set', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.categories = [];
            $scope.categories = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('categories', $scope.categories);
        });

        $scope.$watchCollection('sub_category_set', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.sub_categories = [];
            $scope.sub_categories = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('sub_categories', $scope.sub_categories);
        });

        $scope.$watchCollection('item_set', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.items = [];
            $scope.items = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('items', $scope.items);
        });

        $scope.$watchCollection('option_set', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.options = [];
            $scope.options = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('options', $scope.options);
        });

        $scope.$watchCollection('sub_option_sets', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.sub_options = [];
            $scope.sub_options = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('sub_options', $scope.sub_options);
        });

        $scope.$watchCollection('addon_sets', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            $scope.addons = [];
            $scope.addons = _.compact(
                _.map(newVal, function(val, key) {
                    return val ? key : false;
                })
            );
            console.log('addons', $scope.addons);
        });

        $scope.toggle = function(scope) {
            scope.toggle();
        };

        merchantRESTSvc.getAllMenus()
            .then(function(res) {
                _.each(res.data, function(menu) {
                    var index = _.findIndex($scope.all_menus, function(menu_obj) {
                        return (menu_obj.menu_type === menu.menu_type);
                    })
                    if (index === -1) {
                        $scope.all_menus.push(menu);
                    } else {
                        _.each($scope.all_menus[index].menu_categories, function(category, category_index) {
                            var cat_index = _.findIndex(menu.menu_categories, function(cat_obj) {
                                return cat_obj.category_name === category.category_name;
                            });
                            if (cat_index === -1) {
                                $scope.all_menus[index].menu_categories.splice(category_index, 1);
                            } else {
                                var _sub_categories = $scope.all_menus[index].menu_categories[category_index].sub_categories;
                                _.each(_sub_categories, function(sub_category, sub_category_index) {
                                    var sub_cat_index = _.findIndex(menu.menu_categories[cat_index].sub_categories, function(sub_category_obj) {
                                        return sub_category.sub_category_name === sub_category_obj.sub_category_name;
                                    });
                                    if (sub_cat_index === -1) {
                                        $scope.all_menus[index].menu_categories[category_index].sub_categories.splice(sub_category_index, 1);
                                    } else {
                                        var _items = $scope.all_menus[index].menu_categories[category_index].sub_categories[sub_category_index].items;
                                        _.each(_items, function(item, item_index) {
                                            var itemIndex = _.findIndex(menu.menu_categories[cat_index].sub_categories[sub_cat_index].items, function(item_obj) {
                                                return item_obj.item_name === item.item_name;
                                            });
                                            if (item_index === -1) {
                                                $scope.all_menus[inall_menusdex].menu_categories[category_index].sub_categories[sub_category_index].items.splice(item_index, 1);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }, function(err) {
                console.log(err);
            });

        $scope.processSelection = function() {
            var menus = [];
            var categories = [];
            var sub_categories = [];
            var items = [];
            var options = [];
            var sub_options = [];
            var addons = [];
            if ($scope.menus.length === 0 && $scope.categories.length === 0 && $scope.sub_categories.length === 0 && $scope.items.length === 0 && $scope.options.length === 0 && $scope.sub_options.length === 0 && $scope.addons.length === 0) {
                SweetAlert.swal("No Selection Made Yet!", "Please name atleast one selection", "error");
            } else {
                async.each($scope.all_menus, function(menu, callback) {
                    // console.log('menu', menu._id, $scope.menus.indexOf(menu._id) !== -1);
                    if ($scope.menus.indexOf(menu._id) !== -1) {
                        menus.push(menu._id);
                        var category_ids = _.map(menu.menu_categories, function(category) {
                            return category._id;
                        });
                        if (!_.intersection(category_ids, $scope.categories).length) {
                            categories = categories.concat(category_ids);
                        }
                    }

                    async.each(menu.menu_categories, function(category, callback) {
                        // console.log('category', category._id, $scope.categories.indexOf(category._id) !== -1);
                        if ($scope.categories.indexOf(category._id) !== -1) {
                            categories.push(category._id);
                            var sub_category_ids = _.map(category.sub_categories, function(sub_category) {
                                return sub_category._id;
                            });
                            if (!_.intersection(sub_category_ids, $scope.sub_categories).length) {
                                $scope.sub_categories = $scope.sub_categories.concat(sub_category_ids);
                                sub_categories = sub_categories.concat(sub_category_ids);
                            }
                            if (menus.indexOf(menu._id) === -1) {
                                menus.push(menu._id);
                            }
                        }
                        async.each(category.sub_categories, function(sub_category, callback) {
                            // console.log('sub category', sub_category._id, $scope.sub_categories.indexOf(sub_category._id) !== -1);
                            if ($scope.sub_categories.indexOf(sub_category._id) !== -1) {
                                sub_categories.push(sub_category._id);
                                var item_ids = _.map(sub_category.items, function(item) {
                                    return item._id;
                                });
                                if (!_.intersection(item_ids, $scope.items).length) {
                                    $scope.items = $scope.items.concat(item_ids);
                                    items = items.concat(item_ids);
                                }
                                if (menus.indexOf(menu._id) === -1) {
                                    menus.push(menu._id);
                                }
                                if (categories.indexOf(category._id) === -1) {
                                    categories.push(category._id);
                                }
                            }
                            async.each(sub_category.items, function(item, callback) {
                                // console.log('item', item._id, $scope.items.indexOf(item._id) !== -1);
                                if ($scope.items.indexOf(item._id) !== -1) {
                                    items.push(item._id);
                                    var option_ids = _.map(item.options, function(option) {
                                        return option._id;
                                    });
                                    if (!_.intersection(option_ids, $scope.options).length) {
                                        $scope.options = $scope.options.concat(option_ids);
                                        options = options.concat(option_ids);
                                    }
                                    if (menus.indexOf(menu._id) === -1) {
                                        menus.push(menu._id);
                                    }
                                    if (categories.indexOf(category._id) === -1) {
                                        categories.push(category._id);
                                    }
                                    if (sub_categories.indexOf(sub_category._id) === -1) {
                                        sub_categories.push(sub_category._id);
                                    }
                                }
                                async.each(item.options, function(option, callback) {
                                    // console.log('option', option._id, $scope.options.indexOf(option._id) !== -1);
                                    if ($scope.options.indexOf(option._id) !== -1) {
                                        options.push(option);
                                        var sub_option_ids = _.flatten(_.map(option.sub_options, function(sub_option) {
                                            return _.map(sub_option.sub_option_set, function(sub_option_obj) {
                                                return sub_option_obj._id;
                                            });
                                        }));
                                        var addon_ids = _.flatten(_.map(option.addons, function(addon) {
                                            return _.map(addon.addon_set, function(addon_obj) {
                                                return addon_obj._id;
                                            });
                                        }));
                                        if (!_.intersection(sub_option_ids, $scope.sub_options).length) {
                                            $scope.sub_options = $scope.sub_options.concat(sub_option_ids);
                                            sub_options = sub_options.concat(sub_option_ids);
                                        }
                                        if (!_.intersection(addon_ids, $scope.addons).length) {
                                            $scope.addons = $scope.addons.concat(addon_ids);
                                            addons = addons.concat(addon_ids);
                                        }
                                        if (menus.indexOf(menu._id) === -1) {
                                            menus.push(menu._id);
                                        }
                                        if (categories.indexOf(category._id) === -1) {
                                            categories.push(category._id);
                                        }
                                        if (sub_categories.indexOf(sub_category._id) === -1) {
                                            sub_categories.push(sub_category._id);
                                        }
                                        if (items.indexOf(item._id) === -1) {
                                            items.push(item._id);
                                        }
                                    }
                                    async.parallel({
                                        sub_options: function(callback) {
                                            async.each(item.sub_options, function(sub_option, callback) {
                                                // console.log('sub_option', sub_option._id, $scope.sub_options.indexOf(sub_option._id) === -1);
                                                if (options.indexOf(option._id) !== -1) {
                                                    var sub_option_ids = _.map(sub_option.sub_option_set, function(sub_option_obj) {
                                                        return sub_option_obj._id;
                                                    });
                                                    var intersection = _.intersection(sub_option_ids, $scope.sub_options);
                                                    if (intersection.length) {
                                                        sub_options = sub_options.concat(intersection);
                                                        callback();
                                                    } else {
                                                        sub_options = sub_options.concat(sub_option_ids);
                                                        callback();
                                                    }
                                                } else {
                                                    callback();
                                                }
                                                // if ($scope.sub_options.indexOf(sub_option._id) === -1) {
                                                //     sub_options.push(sub_option._id);
                                                //     if (menus.indexOf(menu._id) === -1) {
                                                //         menus.push(menu._id);
                                                //     }
                                                //     if (categories.indexOf(category._id) === -1) {
                                                //         categories.push(category._id);
                                                //     }
                                                //     if (sub_categories.indexOf(sub_category._id) === -1) {
                                                //         sub_categories.push(sub_category._id);
                                                //     }
                                                //     if (items.indexOf(item._id) === -1) {
                                                //         items.push(item._id);
                                                //     }
                                                //     callback();
                                                // } else {
                                                //     callback();
                                                // }
                                            }, function() {
                                                callback();
                                            });
                                        },
                                        addons: function(callback) {
                                            async.each(item.addons, function(addon, callback) {
                                                // console.log('addon', addon._id, $scope.addons.indexOf(addon._id) === -1);
                                                if (options.indexOf(option._id) !== -1) {
                                                    var addon_ids = _.map(addons.addon_set, function(addon_obj) {
                                                        return addon_obj._id;
                                                    });
                                                    var intersection = _.intersection(addon_ids, $scope.addons);
                                                    if (intersection.length) {
                                                        addons = addons.concat(intersection);
                                                        callback();
                                                    } else {
                                                        addons = addons.concat(addon_ids);
                                                        callback();
                                                    }
                                                } else {
                                                    callback();
                                                }
                                                // if ($scope.addons.indexOf(addon._id) === -1) {
                                                //     addons.push(addon._id);
                                                //     if (menus.indexOf(menu._id) === -1) {
                                                //         menus.push(menu._id);
                                                //     }
                                                //     if (categories.indexOf(category._id) === -1) {
                                                //         categories.push(category._id);
                                                //     }
                                                //     if (sub_categories.indexOf(sub_category._id) === -1) {
                                                //         sub_categories.push(sub_category._id);
                                                //     }
                                                //     if (items.indexOf(item._id) === -1) {
                                                //         items.push(item._id);
                                                //     }
                                                //     callback();
                                                // } else {
                                                //     callback();
                                                // }
                                            }, function() {
                                                callback();
                                            });
                                        }
                                    }, function() {
                                        callback();
                                    });
                                }, function() {
                                    callback();
                                });
                            }, function() {
                                callback();
                            });
                        }, function() {
                            callback();
                        });
                    }, function() {
                        callback();
                    });
                }, function() {
                    console.log({
                        menus: menus,
                        categories: categories,
                        sub_categories: sub_categories,
                        items: items,
                        options: options,
                        sub_options: sub_options,
                        addons: addons
                    });
                    $modalInstance.close({
                        menus: menus,
                        categories: categories,
                        sub_categories: sub_categories,
                        items: items,
                        options: options,
                        sub_options: sub_options,
                        addons: addons
                    });
                });
            }
        };

        $scope.cancelSelection = function() {
            $modalInstance.dismiss('cancel');
        };
    });
