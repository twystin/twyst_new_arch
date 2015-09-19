angular.module('consoleApp')
	.controller('BillViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', '$stateParams', '$http',
		function($scope, toastr, consoleRESTSvc, $log, $stateParams, $http) {
			$scope.updateCheck = function(check, isChecked) {
				$scope[check] = isChecked? true: false
			};

			consoleRESTSvc.getBill($stateParams.bill_id).then(function(res) {
				if(res.data.event_meta.timestamp) {
					res.data.event_meta.timestamp = new Date(res.data.event_meta.timestamp);
				}
				$scope.bill = res.data;
				if($scope.bill.pending) {
					$scope.pending = angular.copy($scope.bill.pending);
					delete $scope.bill.pending;
				}
				console.log(res);
			}, function(err) {
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
						console.log(res);
						toastr.success(res.message);
						$scope.bill = res.data;
					}, function(err) {
						console.log(err);
					});
					// $http.put('/api/v4/events/' + $stateParams.bill_id, $scope.bill).then(function(data) {
					// 	if(data.data)
					// }, function(err) {
					// 	console.log(err);
					// })
				}
			}

			$scope.rejectBill = function() {
				$scope.bill.event_meta.is_rejected = true;
				$scope.bill.event_meta.status = 'Twyst Rejected';

				if(!$scope.isClear) {
					$scope.bill.event_meta.reason = 'Bill is either unclear, incomplete, or manipulaed';
				} else if(!$scope.isBill) {
					$scope.bill.event_meta.reason = 'Image is not of a bill';
				} else if (!$scope.isListed) {
					$scope.bill.event_meta.reason = 'We do not recognize this outlet';
				} else {
					$scope.bill.event_meta.reason = '';
				}

				if($scope.bill.event_meta.reason) {
					consoleRESTSvc.updateBill($scope.bill).then(function(res) {
						console.log(res);
						toastr.success(res.message);
						$scope.bill = res.data;
						$scope.isClear = $scope.isBill = $scope.isListed = false;
					}, function(err) {
						console.log(err);
					});
				} else {
					toastr.error("No criteria to base rejection on", "Validation Error");
				}
			}

			$scope.linkRedemption = function(offer_group) {
				console.log(offer_group);
				console.log($scope.bill.event_meta.offer_group);
				$scope.bill.event_meta.offer_group = offer_group;
				console.log($scope.bill.event_meta.offer_group);
			}
		}
	]);