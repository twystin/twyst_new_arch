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
                    if (!$scope.outlet_id) {
                        $scope.outlet_id = menu.outlet._id;
                        $scope.menus.push(menu);
                    } else if ($scope.outlet_id === menu.outlet._id) {
                        $scope.menus.push(menu);
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
