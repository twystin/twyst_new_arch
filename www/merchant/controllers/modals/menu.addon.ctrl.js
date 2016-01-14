angular.module('merchantApp')
    .controller('MenuAddonController', function($scope, $modalInstance, addon, is_new, limit_access, SweetAlert) {

        $scope.is_new = is_new;
        $scope.addon = addon;
        $scope.limit_access = limit_access;

        $scope.addValuePair = function() {
            $scope.addon.addon_set.push({
                is_vegetarian: true
            });
        };

        $scope.removeValuePair = function(index) {
            $scope.addon.addon_set.splice(index, 1);
        };

        $scope.resolveAddon = function() {
            if (!$scope.addon.addon_title) {
                SweetAlert.swal('Validation Error', 'Title required', 'error');
            } else if (!$scope.addon.addon_set || !$scope.addon.addon_set.length) {
                SweetAlert.swal('Validation Error', 'Please provide atleast one value pair', 'error');
            } else {
                async.each($scope.addon.addon_set, function(addon_obj, callback) {
                    if (!addon_obj.addon_value) {
                        callback('No addon name can be left blank');
                    } else if (!addon_obj.addon_cost && addon_obj.addon_cost !== 0) {
                        callback('No addon cost can be left blank');
                    } else {
                        callback();
                    }
                }, function(err) {
                    if (err) {
                        SweetAlert.error('Validation Error', err, 'error');
                    } else {
                        $modalInstance.close($scope.addon);
                    }
                });
            }
        };

        $scope.discardAddon = function() {
            $modalInstance.dismiss('Cancel');
        };
    })
