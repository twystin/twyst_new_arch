angular.module('merchantApp')
	.controller('PanelHomeController', ['$scope', 'merchantRESTSvc', '$stateParams', '$log', 'toastr',
		function($scope, merchantRESTSvc, $stateParams, $log, toastr) {
			merchantRESTSvc.getOutlets().then(function(res) {
				console.log(res);
				$scope.outlets = _.indexBy(res.data.outlets, '_id')
				if(Object.keys($scope.outlets).length) {
					$scope.choosen_outlet = Object.keys($scope.outlets)[0];
				}
			}, function(err) {
				console.log(err);
			})

			$scope.resetForms = function() {
				$scope.show_vouchers = false;
				$scope.search = {};
				$scope.checkin = {};
			}

			$scope.redeemUserCoupon = function(code) {
				$scope.show_vouchers = false;
				merchantRESTSvc.redeemUserCoupon($scope.choosen_outlet, code)
					.then(function(data) {
						toastr.success(data.message);
					}, function(err) {
						toastr.error(err.message, "Error");
						console.log(err);
					});
			}

			$scope.getVouchersByPhone = function() {
				$scope.show_vouchers = false;
				if(!$scope.search || !$scope.search.number) {
					toastr.error("Fill-in the phone number", "Error");
				} else if(!/^[0-9]{10}$/.test($scope.search.number)) {
					toastr.error("Number entered is invalid. Please recheck", "Error")
				} else {
					merchantRESTSvc.getVouchersByPhone($scope.choosen_outlet, $scope.search.number)
						.then(function(data) {
							$scope.search = {};
							$scope.show_vouchers = true;
							$scope.user_vouchers = data.data;
							toastr.success(data.message);
							console.log('data', data);
						}, function(err) {
							$scope.search = {};
							console.log('err', err);
						})
				}
			}

			$scope.checkinUser = function() {
				$scope.show_vouchers = false;
				if (!$scope.checkin || !$scope.checkin.number) {
					toastr.error("Please finn-in the customer's number", "Error");
				} else if (!/^[0-9]{10}$/.test($scope.checkin.number)) {
					toastr.error("Number entered is invalid. Please recheck", "Error");
				} else {
					var req_obj = {
						"event_meta": {
							phone: $scope.checkin.number
						},
						event_outlet: $scope.choosen_outlet
					};
					if($scope.checkin.date) {
						req_obj.event_meta.date = $scope.checkin.date;
					}
					merchantRESTSvc.checkinUser(req_obj)
						.then(function(res) {
							$scope.checkin = {};
							var success_msg;
							if(_.has(res, 'data.code')) {
								success_msg = "CHeckin successfull. New voucher earned. Will be available in 3 hours";
							} else {
								success_msg = "CHeckin successfull";
							}
							toastr.success(success_msg);
						}, function(err) {
							$scope.checkin = {};
							var error_msg;
							if (err.data.indexOf('-')===-1) {
								error_msg = err.data;
							} else {
								error_msg = err.data.slice(err.data.indexOf('-') + 2)
							}
							toastr.error(error_msg, "Error")
						})
				}
			}

			$scope.getVoucherByCode = function() {
				$scope.show_vouchers = false;
				if (!$scope.search || !$scope.search.code) {
					toastr.error("Please fill-in the voucher code", "Error");
				} else {
					merchantRESTSvc.getVoucherByCode($scope.choosen_outlet, $scope.search.code)
						.then(function(data) {
							$scope.search = {};
							$scope.show_vouchers = true;
							$scope.user_vouchers = [data.data];
							console.log('data', data);
							toastr.success(data.message);
						}, function(err) {
							$scope.search = {};
							console.log('err', err);
						})
				}
			}
		}
	]);