angular.module('consoleApp')
	.controller('BillManageController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {

			$scope.sort_order = {
				'event_date': 'Oldest First',
				'-event_date': 'Newest FIrst'
			};

			$scope.view_options = {
				'submitted': 'Submitted',
				'twyst_approved': 'Twyst Approved',
				'outlet_pending': 'Outlet Pending',
				'twyst_rejected': 'Twyst Rejected',
				'outlet_rejected': 'Outlet Rejected',
				'verified': 'Verified'
			}

			$scope.sort = 'event_date';
			$scope.view_by = 'submitted';

			$scope.getBills = function() {
				consoleRESTSvc.getEvents('upload_bill', $scope.view_by, $scope.sort).then(function(res) {
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
				console.log(val);
				$scope.view_by = val;
				$scope.getBills();
			}
		}
	])