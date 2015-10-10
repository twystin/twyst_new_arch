angular.module('consoleApp')
	.controller('OutletManageController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {
			$scope.current_page = 1;
			$scope.per_page = 10;

			$scope.loadOutlets = function() {
				consoleRESTSvc.getAllOutlets().then(function(res) {
					console.log(res);
					$scope.outlets = res.data;
					$scope.outletCount = $scope.outlets.length;
					$scope.visible_outlets = $scope.outlets.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
				}, function(err) {
					console.log(err);
				})
			}

			$scope.updateList = function() {
				$scope.visible_outlets = $scope.outlets.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
			}

			$scope.updateOutletStatus = function(outlet) {
				consoleRESTSvc.updateOutletStatus(outlet._id, outlet.status)
					.then(function(res) {
						console.log(res);
						toastr.success("Outlet status updated")
					}, function(err) {
						if(err.message) {
							toastr.error(err.message);
						} else {
							toastr.error("Unable to update the outlet status right now");
						}
						console.log(err);
					});
			}

			$scope.filterOutlets = function(reset_page) {
				if(reset_page) {
					$scope.current_page = 1;
				}
				if(!$scope.outletFilter) {
					$scope.visible_outlets = $scope.outlets.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
					$scope.outletCount = $scope.outlets.length;
				} else {
					var regex = new RegExp($scope.outletFilter, 'i');
					var filtered_outlets = _.filter($scope.outlets, function(outlet) {
						return regex.test(outlet.name) || regex.test(outlet.address) || regex.test(outlet.locality_1) || regex.test(outlet.locality_2) || regex.test(outlet.city) || regex.test(outlet.pin) || regex.test(outlet._id);
					});
					$scope.outletCount = filtered_outlets.length
					$scope.visible_outlets = filtered_outlets.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
				}
				
			}
		}
	]);