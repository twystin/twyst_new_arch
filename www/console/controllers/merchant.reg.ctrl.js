angular.module('consoleApp')
	.controller('MerchantRegisterController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', 
		function($scope, toastr, consoleRESTSvc, $log) {
			$scope.registerMerchant = function() {
				if(!$scope.merchant) {
					toastr.error('Please fill-in the form first', 'Error');
				} else if(!$scope.merchant.username) {
					toastr.error('Username required', 'Error');
				} else if(!$scope.merchant.password) {
					toastr.error('Password required', 'Error');
				} else if(!$scope.merchant.rePassword) {
					toastr.error('Please retype the password', 'Error');
				} else if(!_.isEqual($scope.merchant.password, $scope.merchant.rePassword)) {
					toastr.error('Passwords do not match', 'Error');
				} else if($scope.merchant.isPaying && !$scope.merchant.email) {
					toastr.error('Email ID required', 'Error');
				} else {
					var merchant = {
						username: $scope.merchant.username.toLowerCase(),
						password: $scope.merchant.password,
						isPaying: false,
						role: 3
					};

					if($scope.merchant.isPaying) {
						merchant.isPaying = true;
						merchant.email = $scope.merchant.email;
					}

					consoleRESTSvc.registerMerchant(merchant).then(function(res) {
						if(res.response) {
							toastr.success(res.message);	
							$scope.merchant = {};
						} else {
							toastr.error(res.message, 'Error');
						}
					}, function(err) {
						if(err.info.message) {
							toastr.error(err.info.message, 'Error');
						} else {
							toastr.error('Failed to register merchant. Please twy again after sometime', 'Error');
						}
					});
				}
			}

			$scope.isPayingUpdated = function() {
				if(!$scope.merchant.isPaying) {
					$scope.merchant.email = '';
				}
			}
		}
	])