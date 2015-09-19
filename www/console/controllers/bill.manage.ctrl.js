angular.module('consoleApp')
	.controller('BillManageController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {
			consoleRESTSvc.getBills().then(function(res) {
				$scope.bills = res.data;
				console.log(res);
			}, function(err) {
				console.log(err);
			})

			$scope.sort_order = {
				'oldest_first': 'Oldest First',
				'newest_first': 'Newest FIrst'
			};

			$scope.view_options = {
				'pending': 'Pending',
				'approved': 'Approved',
				'rejected': 'Rejected',
				'all': 'All'
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