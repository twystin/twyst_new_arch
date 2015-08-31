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
						$cookies.put('token', res.data.data);
						$rootScope.token = res.data.data;
						toastr.success("Logged in successfully");
						$timeout(function() {
							$state.go('merchant.home', {}, {
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