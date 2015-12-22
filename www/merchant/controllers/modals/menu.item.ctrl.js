angular.module('merchantApp')
    .controller('MenuItemController', function($scope, $modalInstance, item, is_new, SweetAlert, $q) {

        $scope.is_new = is_new;
        $scope.item = item;
        if (!is_new) {
            _.each($scope.days, function(day) {
                $scope.checkModel[day] = $scope.item.item_available_on.indexOf(day) !== -1 ? true : false;
            });
            if ($scope.item.item_availability.start_date) {
                $scope.item.item_availability.start_date = new Date($scope.item.item_availability.start_date);
            }
            if ($scope.item.item_availability.end_date) {
                $scope.item.item_availability.end_date = new Date($scope.item.item_availability.end_date);
            }
        }

        $scope.checkModal = {};
        $scope.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        $scope.$watchCollection('checkModal', function() {
            $scope.item.item_available_on = [];
            angular.forEach($scope.checkModal, function(val, key) {
                if (val) {
                    $scope.item.item_available_on.push(key);
                }
            });
        });

        $scope.resolveItem = function() {
            console.log($scope.item);
            $scope.validateItem().then(function() {
                $modalInstance.close($scope.item);
            }, function(err) {
                SweetAlert.swal("Validation Erorr", err, 'error');
            });
        };

        $scope.discardItem = function() {
            $modalInstance.dismiss('Cancel');
        };

        $scope.validateItem = function() {
            var deferred = $q.defer();
            if (!$scope.item.item_name) {
                deferred.reject('Item name required.');
            } else if (!$scope.item.item_cost && $scope.item.item_cost!==0) {
                deferred.reject('Item cost required.');
            } else if (!$scope.item.item_tags || !$scope.item.item_tags.length) {
                deferred.reject('Atleast one tag required')
            } else if (!$scope.item.item_type) {
                deferred.reject('Item type must be selected');
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };
    })
