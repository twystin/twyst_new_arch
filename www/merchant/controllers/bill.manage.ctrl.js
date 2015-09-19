angular.module('merchantApp')
	.controller('BillManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {
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

			merchantRESTSvc.getBills().then(function(res) {
				$scope.bills = res.data;
				console.log(res);
			}, function(err) {
				console.log(err);
			})
		}
	])