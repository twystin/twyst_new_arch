angular.module('consoleApp').controller('OutletViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$stateParams',
    function($scope, toastr, consoleRESTSvc, $stateParams) {
        
        $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // consoleRESTSvc.getAllOutlets().then(function(data) {
        //     $scope.outlet = _.find(data.data, function(outlet) {
        //         return outlet._id === $stateParams.outlet_id;
        //     });
        //     if ($scope.outlet) {
        //         _.each(days, function(day) {
        //             _.each($scope.outlet.business_hours[day].timings, function(timing) {
        //                 var
        //             })
        //         })
        //     }
        //     console.log($scope.outlet);
        //     console.log(data);
        // }, function(err) {
        //     console.log(err);
        // });

		$scope.map = { center: { latitude: 28.805422897457665, longitude: 77.16647699812655 }, zoom: 14 };
		$scope.marker = { id: 0, coords: { latitude: 28.6078341976, longitude: 77.2465642784 } };

        consoleRESTSvc.getAllOutlets().then(function(res) {
            angular.forEach(res.data, function(outlet) {
                if (outlet._id == $stateParams.outlet_id) {
                    $scope.outlet = angular.copy(outlet);
                    $scope.outlet.attributes.cost_for_two.min = $scope.outlet.attributes.cost_for_two.min.toString();
                    $scope.outlet.attributes.cost_for_two.max = $scope.outlet.attributes.cost_for_two.max.toString();
                    $scope.map.center = {
                        latitude: $scope.outlet.contact.location.coords.latitude,
                        longitude: $scope.outlet.contact.location.coords.longitude
                    };
                    $scope.marker.coords = {
                        latitude: $scope.outlet.contact.location.coords.latitude,
                        longitude: $scope.outlet.contact.location.coords.longitude
                    };
                    angular.forEach($scope.outlet.business_hours, function(schedule) {
                        angular.forEach(schedule.timings, function(timing) {
                            var _time = new Date();
                            _time.setHours(timing.open.hr);
                            _time.setMinutes(timing.open.min);
                            _time.setSeconds(0);
                            _time.setMilliseconds(0);
                            timing.open.time = _.clone(_time);
                            _time.setHours(timing.close.hr);
                            _time.setMinutes(timing.close.min);
                            timing.close.time = _.clone(_time);
                        });
                    });
                }
            });
        }, function(err) {
            $log.log('err', err);
        });
    }
])