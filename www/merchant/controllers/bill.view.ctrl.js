angular.module('merchantApp')
	.controller('BillViewManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr', '$http', '$stateParams',
		function($scope, merchantRESTSvc, $log, toastr, $http, $stateParams) {
			merchantRESTSvc.getBill($stateParams.bill_id).then(function(res) {
				console.log(res);
				$scope.bill = res.data;
			}, function(err) {
				console.log(err);
			})

			$scope.approveBill = function() {
				$scope.bill.event_meta.status = "Verified";
				merchantRESTSvc.updateBill($scope.bill).then(function(res) {
					$scope.bill = res.data;
				}, function(err) {
					console.log(err);
				})
			}

			$scope.rejectBill = function() {
				$scope.bill.event_meta.status = "Outlet Rejected";
				$scope.bill.event_meta.is_rejected = true;
				$scope.bill.event_meta.reason = 'Declined by the outlet';
				merchantRESTSvc.updateBill($scope.bill).then(function(res) {
					$scope.bill = res.data;
				}, function(err) {
					console.log(err);
				})
			}
		}
	])