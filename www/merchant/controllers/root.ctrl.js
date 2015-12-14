angular.module('merchantApp')
	.controller('RootController', ['$scope', '$rootScope', '$state', 'merchantRESTSvc', 'SweetAlert', '$cookies',
		function($scope, $rootScope, $state, merchantRESTSvc, SweetAlert, $cookies) {
			if (!$rootScope.token && ($state.current.name !== 'merchant.login')) {
				$state.go('merchant.login', {}, {
					reload: true
				});
			}

			$scope.logout = function() {
				merchantRESTSvc.logout()
					.then(function(data) {
							$cookies.remove('token');
							$cookies.remove('isPaying');
							$rootScope.isPaying = undefined;
							$rootScope.token = undefined;
							SweetAlert.swal({
								title: "Logged out successfully", 
								type: 'success',
								showCancelButton: false,
								confirmButtonText: 'Continue'
							}, function() {
								$state.go('merchant.login', {}, {
									reload: true
								});
							});
					}, function(err) {
						var message;
						if(err.message) {
							message = err.message;
						} else {
							message = 'Something went wrong';
						}
						SweetAlert.swal({
							title: 'ERROR',
							text: message,
							type: 'error',
							confirmButtonText: 'Continue',
							closeOnConfirm: false,
						});
					});
			}
		}
	])