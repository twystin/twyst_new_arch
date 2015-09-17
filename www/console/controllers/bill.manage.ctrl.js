angular.module('consoleApp')
	.controller('BillManageController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {
			$scope.sort_order = {
				'oldest_first': 'Oldest First',
				'newest_first': 'Newest FIrst'
			};

			$scope.view_options = {
				'pending': 'Pending',
				'all': 'All',
				'approved': 'Approved',
				'rejected': 'Rejected'
			}

			$scope.sort = 'oldest_first';
			$scope.view_by = 'pending';

			$scope.updateSortOrder = function(sort) {
				$scope.sort = sort;
			}

			$scope.updateViewBy = function(val) {
				$scope.view_by = val;
			}
		}
	])