angular.module('consoleApp')
	.controller('BillViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', '$stateParams', '$http',
		function($scope, toastr, consoleRESTSvc, $log, $stateParams, $http) {
			$scope.updateCheck = function(check, isChecked) {
				$scope[check] = isChecked? true: false
			};

			consoleRESTSvc.getAllOutlets().then(function(res) {
				$scope.outlets = _.map(res.data, function(outlet) {
	                   return {
	                           _id: outlet._id,
	                           name: outlet.basics.name,
	                           address: outlet.contact.location.address,
	                           locality_1: outlet.contact.location.locality_1[0],
	                           locality_2: outlet.contact.location.locality_2[0],
	                           city: outlet.contact.location.city,
	                           pin: outlet.contact.location.pin
	                   }
	           });

			}, function(err) {
				if (err.message) {
					toastr.error(err.message, "Error");
				}
				console.log(err);
			})

			consoleRESTSvc.getBill($stateParams.bill_id).then(function(res) {
				console.log(res);
				if(res.data.data.event_meta.timestamp) {
					res.data.data.event_meta.timestamp = new Date(res.data.data.event_meta.timestamp);
				}
				$scope.bill = res.data.data;

				if(res.data.pending) {
					$scope.pending = angular.copy(res.data.pending);
					
				}
				
			}, function(err) {
				if (err.message) {
					toastr.error(err.message, "Error");
				}
				console.log(err);
			});

			$scope.approveBill = function() {
				if (!$scope.bill.event_meta.bill_number) {
					toastr.error("Bill Number required", "Validation Error");
				} else if (!$scope.bill.event_meta.timestamp) {
					toastr.error("Bill date and time required", "Validation Error");
				} else if(!$scope.bill.event_meta.bill_amount) {
					toastr.error("Bill amount required");
				} else {
					if(!$scope.bill.event_meta.issued_for) {
						$scope.bill.event_meta.status = 'twyst_approved';	
					} else {
						$scope.bill.event_meta.status = 'outlet_pending';
					}
					
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
				$scope.bill.event_meta.status = 'twyst_rejected';

				if($scope.isDuplicate) {
					$scope.bill.event_meta.status = 'archived';
					$scope.bill.event_meta.reason = 'Bill is duplicate';
				} else if(!$scope.isBill) {
					$scope.bill.event_meta.reason = 'Image is not of a bill.';
				} else if(!$scope.isClear) {
					$scope.bill.event_meta.reason = 'Bill image is either unclear, incomplete, or manipulated.';
				}  else if (!$scope.isListed) {
					$scope.bill.event_meta.reason = 'Outlet is not listed on Twyst.';
				} else {
					$scope.bill.event_meta.reason = '';
				}

				if($scope.bill.event_meta.reason) {
					consoleRESTSvc.updateBill($scope.bill).then(function(res) {
						$scope.bill = res.data;
						console.log($scope.bill)
						$scope.isClear = $scope.isBill = $scope.isListed = false;
						toastr.success(res.message);
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

			$scope.linkRedemption = function(item) {
				$scope.bill.event_meta.issued_for = item.issued_for;
				$scope.bill.event_meta.pending_coupon = item._id;
			}
		}
	]);