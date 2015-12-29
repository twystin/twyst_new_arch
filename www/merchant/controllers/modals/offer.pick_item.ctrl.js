angular.module('merchantApp')
    .controller('PickItemController', function($scope, $modalInstance, merchantRESTSvc, item_only, SweetAlert) {
        $scope.item_only = item_only;

        $scope.sub_option_sets = {};
        $scope.sub_options = [];

        $scope.addon_sets = {};
        $scope.addons = [];

        $scope.menus = [];

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
        });

        $scope.toggle = function(scope) {
            scope.toggle();
        };

        merchantRESTSvc.getAllMenus()
            .then(function(res) {
                _.each(res.data, function(menu) {
                    var index = _.findIndex($scope.menus, function(menu_obj) {
                        return (menu_obj.menu_type === menu.menu_type);
                    })
                    if (index === -1) {
                        $scope.menus.push(menu);
                    } else {
                        _.each($scope.menus[index].menu_categories, function(category, category_index) {
                            var cat_index = _.findIndex(menu.menu_categories, function(cat_obj) {
                                return cat_obj.category_name === category.category_name;
                            });
                            if (cat_index === -1) {
                                $scope.menu[index].menu_categories.splice(category_index, 1);
                            } else {
                                var _sub_categories = $scope.menus[index].menu_categories[category_index].sub_categories;
                                _.each(_sub_categories, function(sub_category, sub_category_index) {
                                    var sub_cat_index = _.findIndex(menu.menu_categories[cat_index].sub_categories, function(sub_category_obj) {
                                        return sub_category.sub_category_name === sub_category_obj.sub_category_name;
                                    });
                                    if (sub_cat_index === -1) {
                                        $scope.menu[index].menu_categories[category_index].sub_categories.splice(sub_category_index, 1);
                                    } else {
                                        var _items = $scope.menus[index].menu_categories[category_index].sub_categories[sub_category_index].items;
                                        _.each(_items, function(item, item_index) {
                                            var itemIndex = _.findIndex(menu.menu_categories[cat_index].sub_categories[sub_cat_index].items, function(item_obj) {
                                                return item_obj.item_name === item.item_name;
                                            });
                                            if(item_index === -1) {
                                                $scope.menu[index].menu_categories[category_index].sub_categories[sub_category_index].items.splice(item_index, 1);
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

        $scope.pickMenu = function(menu_id) {
            $modalInstance.close({
                menu_id: menu_id
            });
        };

        $scope.pickCategory = function(menu_id, category_id) {
            $modalInstance.close({
                menu_id: menu_id,
                category_id: category_id
            });
        };

        $scope.pickSubCategory = function(menu_id, category_id, sub_category_id) {
            $modalInstance.close({
                menu_id: menu_id,
                category_id: category_id,
                sub_category_id: sub_category_id
            });
        };

        $scope.pickItem = function(menu_id, category_id, sub_category_id, item_id) {
            $modalInstance.close({
                menu_id: menu_id,
                category_id: category_id,
                sub_category_id: sub_category_id,
                item_id: item_id
            });
        };

        $scope.pickOption = function(menu_id, category_id, sub_category_id, item_id, option) {
            var obj = {
                menu_id: menu_id,
                category_id: category_id,
                sub_category_id: sub_category_id,
                item_id: item_id,
                option_id: option._id
            };

            var sub_option_set = _.flattenDeep(_.map(option.sub_options, function(sub_option) {
                return _.map(sub_option.sub_option_set, function(sub_option_obj) {
                    return sub_option_obj._id;
                });
            }));
            var addon_set = _.flattenDeep(_.map(option.addons, function(addon) {
                return _.map(addon.addon_set, function(addon_obj) {
                    return addon_obj._id;
                });
            }));

            obj.sub_options = _.filter($scope.sub_options, function(sub_option) {
                return sub_option_set.indexOf(sub_option) !== -1;
            });
            obj.addons = _.filter($scope.addons, function(addon) {
                return addon_set.indexOf(addon) !== -1;
            });

            if (!obj.sub_options || !obj.sub_options.length) {
                obj.sub_options = sub_option_set;
            }
            if (!obj.addons || !obj.addons.length) {
                obj.addons = addon_set;
            }

            $modalInstance.close(obj);
        };

    });
