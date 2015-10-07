angular.module('consoleApp')
	.controller('BillViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', '$stateParams', '$http',
		function($scope, toastr, consoleRESTSvc, $log, $stateParams, $http) {
			$scope.updateCheck = function(check, isChecked) {
				$scope[check] = isChecked? true: false
			};

			consoleRESTSvc.getAllOutlets().then(function(res) {
				$scope.outlets = res.data;
			}, function(err) {
				if (err.message) {
					toastr.error(err.message, "Error");
				}
				console.log(err);
			})

			consoleRESTSvc.getBill($stateParams.bill_id).then(function(res) {
				if(res.data.event_meta.timestamp) {
					res.data.event_meta.timestamp = new Date(res.data.event_meta.timestamp);
				}
				$scope.bill = res.data;
				if($scope.bill.pending) {
					$scope.pending = angular.copy($scope.bill.pending);
					delete $scope.bill.pending;
				}
			}, function(err) {
				if (err.message) {
					toastr.error(err.message, "Error");
				}
				console.log(err);
			});

			$scope.approveBill = function() {
				if(!$scope.bill.event_meta.merchant) {
					toastr.error("Merchant Name required", "Validation Error");
				} else if (!$scope.bill.event_meta.bill_number) {
					toastr.error("Bill Number required", "Validation Error");
				} else if (!$scope.bill.event_meta.timestamp) {
					toastr.error("Bill date and time required", "Validation Error");
				} else if(!$scope.bill.event_meta.bill_amount) {
					toastr.error("Bill amount required");
				} else {
					$scope.bill.event_meta.status = 'Twyst Approved';
					consoleRESTSvc.updateBill($scope.bill).then(function(res) {
						toastr.success(res.message);
						$scope.bill = res.data;
					}, function(err) {
						if (err.message) {
							toastr.error(err.message, "Error");
						}
						console.log(err);
					});
				}
			}

			$scope.updateOutletId = function(outlet) {
				$scope.bill.event_outlet = outlet._id;
			}

			$scope.rejectBill = function() {
				$scope.bill.event_meta.is_rejected = true;
				$scope.bill.event_meta.status = 'Twyst Rejected';

				if(!$scope.isClear) {
					$scope.bill.event_meta.reason = 'Bill image is either unclear, incomplete, or manipulated.';
				} else if(!$scope.isBill) {
					$scope.bill.event_meta.reason = 'Image is not of a bill.';
				} else if (!$scope.isListed) {
					$scope.bill.event_meta.reason = 'Outlet is not listed on Twyst.';
				} else {
					$scope.bill.event_meta.reason = '';
				}

				if($scope.bill.event_meta.reason) {
					consoleRESTSvc.updateBill($scope.bill).then(function(res) {
						toastr.success(res.message);
						$scope.bill = res.data;
						$scope.isClear = $scope.isBill = $scope.isListed = false;
					}, function(err) {
						if (err.message) {
							toastr.error(err.message, "Error");
						}
						console.log(err);
					});
				} else {
					toastr.error("No criteria to base rejection on", "Validation Error");
				}
			}

			$scope.linkRedemption = function(issued_for) {
				$scope.bill.event_meta.issued_for = issued_for;
			}
		}
	]);