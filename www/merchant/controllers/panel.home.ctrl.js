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

			$scope.maxDate = new Date();
			$scope.minDate = new Date($scope.maxDate.getTime() - (7 * 24 * 60 * 60 * 1000))

			$scope.checkin = {
				date: new Date()
			};

			$scope.resetForms = function() {
				$scope.show_vouchers = false;
				$scope.show_msg = false;
				$scope.search = {};
				$scope.checkin.number = '';
			}

			$scope.redeemUserCoupon = function(code) {
				$scope.show_vouchers = false;
				$scope.show_msg = false;
				merchantRESTSvc.redeemUserCoupon($scope.choosen_outlet, code)
					.then(function(data) {
						console.log(data);
						var show_vouchers = true;
						$scope.user_vouchers = [data.data];
						toastr.success(data.message);
					}, function(err) {
						toastr.error(err.message, "Error");
						console.log(err);
					});
			}

			$scope.getVouchersByPhone = function() {
				$scope.show_vouchers = false;
				$scope.show_msg = false;
				if(!$scope.search || !$scope.search.number) {
					toastr.error("Fill-in the phone number", "Error");
				} else if(!/^[0-9]{10}$/.test($scope.search.number)) {
					toastr.error("Number entered is invalid. Please recheck", "Error")
				} else {
					merchantRESTSvc.getVouchersByPhone($scope.choosen_outlet, $scope.search.number)
						.then(function(data) {
							$scope.search = {};
							$scope.today = new Date();
							$scope.show_vouchers = true;
							$scope.user_vouchers = data.data;
							_.each($scope.user_vouchers, function(voucher) {
								voucher.lapse_date = new Date(voucher.lapse_date);
							})
							if(!$scope.user_vouchers.length) {
								$scope.show_msg = true;
								toastr.warning("No vouchers found");
							} else {
								toastr.success(data.message);	
							}
							console.log('data', data);
						}, function(err) {
							$scope.search = {};
							console.log('err', err);
							toastr.error("Unable to find voucher");
						})
				}
			}

			$scope.checkinUser = function() {
				$scope.show_vouchers = false;
				$scope.show_msg = false;
				if (!$scope.checkin || !$scope.checkin.number) {
					toastr.error("Please enter the customer's number", "Error");
				} else if (!/^[0-9]{10}$/.test($scope.checkin.number)) {
					toastr.error("Number entered is invalid. Please recheck", "Error");
				} else if(!$scope.checkin.date) {
					toastr.error("Please select checkin date", "Error");
				} else {
					var req_obj = {
						"event_meta": {
							phone: $scope.checkin.number
						},
						event_outlet: $scope.choosen_outlet
					};
					if($scope.checkin.date) {
						var today = new Date();
						$scope.checkin.date.setHours(today.getHours());
						$scope.checkin.date.setMinutes(today.getMinutes());
						req_obj.event_date = $scope.checkin.date;
						req_obj.event_meta.date = new Date();
					}
					merchantRESTSvc.checkinUser(req_obj)
						.then(function(res) {
							$scope.checkin.number = '';
							var success_msg;
							if(!_.has(res, 'data.checkins_to_go')) {
								console.log(res.data);
								$scope.show_vouchers = true;
								$scope.user_vouchers = [res.data];
								success_msg = "Checkin successfull, User also unlocked a coupon";
							} else {
								success_msg = "Checkin successfull";
							}
							toastr.success(success_msg);
						}, function(err) {
							$scope.checkin.number = '';
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
				$scope.show_msg = false;
				if (!$scope.search || !$scope.search.length === 6  ) {
					toastr.error("Please fill-in the voucher code", "Error");
				} else {
					merchantRESTSvc.getVoucherByCode($scope.choosen_outlet, $scope.search.code)
						.then(function(data) {
							$scope.search = {};
							$scope.show_vouchers = true;
							$scope.user_vouchers = [data.data];
							data.data.lapse_date = new Date(data.data.lapse_date);
							if(!$scope.user_vouchers.length) {
								$scope.show_msg = true;
								toastr.warning("No active voucher found");
							} else {
								toastr.success(data.message);
							}
							console.log('data', data);
						}, function(err) {
							$scope.show_msg = true;
							$scope.search = {};
							toastr.warning("No active vouchers found");
							console.log('err', err);
						})
				}
			}

			$scope.retrieveNotifications = function(outlet_id) {
				// merchantRESTSvc.getNotifications(outlet_id).then(function(data) {
				// 	console.log(data);
				// 	$scope.notifictions = data.data;
				// }, function(err) {
				// 	console.log(err);
				// })
			}
		}
	]);