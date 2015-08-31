angular.module('merchantApp')
	.controller('OutletViewController', ['$scope', 'merchantRESTSvc', '$stateParams', '$log',
		function($scope, merchantRESTSvc, $stateParams, $log) {

			$scope.attribute_set = [{ class_name: 'home_delivery', text: 'Home Delivery?' }, { class_name: 'dine_in', text: 'Dine-in Available?' }, { class_name: 'veg', text: 'Pure Vegitarian?' }, { class_name: 'alcohol', text: 'Serves alcohol' }, { class_name: 'outdoor', text: 'Outdoor sitting' }, { class_name: 'foodcourt', text: 'Inside a food court' }, { class_name: 'smoking', text: 'Smoking allowed?' }, { class_name: 'chain', text: 'Part of a chain?' }];

			$scope.acStatus = {
				"available": "Available", 
				"not_available": "Unavailable", 
				"partial": 'Partially', 
				"unknown": 'Not Known'
			};
			$scope.parkingStatus = {
				"available": "Available", 
				"not_available": "Unavailable", 
				"valet": 'Valet Available', 
				"unknown": 'Not Known'
			};
			$scope.reservationStatus = {
				"suggested": "Suggested", 
				"not_required": 'Not Required', 
				"unknown": 'Not Known'
			};
			$scope.wifiStatus = {
				"not_available": "Unavailable", 
				"free": "Free Access", 
				"paid": 'Paid Access', 
				"unknown": 'Not Known'
			};

			merchantRESTSvc.getOutlet($stateParams.outletId)
				.then(function(res) {
					if(res.response) {
						$scope.outlet = res.data.outlet;
					} else {
						$log.log('err', err);
					}
				}, function(err) {
					$log.log('err', err);
				})
		}
	])