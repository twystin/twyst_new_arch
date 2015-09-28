angular.module('merchantApp')
	.controller('LoginController', ['$scope', '$rootScope', 'merchantRESTSvc', '$state', '$log', '$cookies', 'toastr', '$timeout',
		function($scope, $rootScope, merchantRESTSvc, $state, $log, $cookies, toastr, $timeout) {
			if($rootScope.token) {
				$state.go('merchant.home', {}, {
					reload: true
				});
			}

			$scope.login = function() {
				merchantRESTSvc.login($scope.user)
					.then(function(res) {
						$cookies.put('token', res.data.data.data.token);
						$cookies.put('isPaying', res.data.data.data.is_paying);
						$rootScope.token = res.data.data.data.token;
						$rootScope.isPaying = res.data.data.data.is_paying;
						toastr.success("Logged in successfully");
						$timeout(function() {
							$state.go('merchant.panel', {}, {
								reload: true
							});
						}, 900);
					}, function(err) {
						if(err.data) {
							toastr.error(err.data, "Error");
						} else {
							toastr.error("Invalid credentials.", "Error");
						}
					})
			}
		}
	])