angular.module('consoleApp')
	.controller('BillManageController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {

			$scope.sort_order = {
				'event_date': 'Oldest First',
				'-event_date': 'Newest FIrst'
			};

			$scope.view_options = ['Submitted', 'Twyst Approved', 'Twyst Rejected', 'Outlet Rejected', 'Verified', 'All']

			$scope.sort = 'event_date';
			$scope.view_by = 'Submitted';

			$scope.getBills = function() {
				consoleRESTSvc.getBills($scope.view_by, $scope.sort).then(function(res) {
					$scope.bills = res.data;
				}, function(err) {
					if (err.message) {
						toastr.error(err.message, "Error");
					}
					console.log(err);
				})
			}

			$scope.updateSortOrder = function(sort) {
				$scope.sort = sort;
				$scope.getBills();
			}

			$scope.updateViewBy = function(val) {
				$scope.view_by = $scope.view_options[val];
				$scope.getBills();
			}
		}
	])