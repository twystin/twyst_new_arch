angular.module('merchantApp')
	.controller('BillManageController', ['$scope', 'merchantRESTSvc', 'SweetAlert',
		function($scope, merchantRESTSvc, SweetAlert) {
			_id = undefined;

			$scope.filters = {
				userId: '',
				outletName: '',
				date: '',
				status: ''
			}

			$scope.sort_order = {
				'oldest_first': 'Oldest First',
				'newest_first': 'Newest First'
			}

			$scope.view_options = {
				'submitted': 'Submitted',
				'twyst_approved': 'Twyst Approved',
				'twyst_rejected': 'Twyst Rejected',
				'outlet_pending': 'Outlet Pending',
				'outlet_approved': 'Outlet Approved',
				'outlet_pending': 'Outlet Pending',
				'archived': 'Archived'
			}

			$scope.sort = 'oldest_first';
			$scope.view_by = 'submitted';

			$scope.updateSortOrder = function(sort) {
				$scope.sort = sort;
			}

			$scope.updateViewBy = function(val) {
				$scope.view_by = val;
			}

			$scope.billFilter = function(bill) {
				var uIdFilter = new RegExp($scope.filters.userId, 'i'),
					oNameFilter = new RegExp($scope.filters.outletName, 'i'),
					statusFilter = new RegExp($scope.filters.status, 'i');

				return (uIdFilter.test(bill.event_user) && oNameFilter.test(bill.event_meta.outlet_name) && statusFilter.test(bill.event_meta.status));
			}

			$scope.getBills = function() {
				merchantRESTSvc.getBills($scope.view_by, $scope.sort)
					.then(function(res) {
						$scope.bills = res.data;
					}, function(err) {
						var message = err.message? err.message: 'Something went wrong.';
						SweetAlert.swal({
							title: 'ERROR',
							text: message,
							type: 'error',
							showCancelButton: false,
							confirmButtonColor: "#DD6B55",
							confirmButtonText: 'Continue',
							closeOnConfirm: true
						});
					});
			}

		}
	])