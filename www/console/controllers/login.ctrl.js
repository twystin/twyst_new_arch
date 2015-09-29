angular.module('consoleApp')
	.controller('LoginController', ['$scope', '$cookies', '$log', '$state', 'toastr', '$rootScope', 'consoleRESTSvc',
		function($scope, $cookies, $log, $state, toastr, $rootScope, consoleRESTSvc) {
			if($rootScope.token) {
				$state.go('console.home', {}, {
					reload: true
				});
			}

			$scope.login = function() {
				consoleRESTSvc.login($scope.user)
					.then(function(res) {
						if(res.data.data.data.is_admin) {
							$cookies.put('token', res.data.data.data.token);
							$rootScope.token = res.data.data.data.token;
							toastr.success("Logged in successfully");
							$state.go('console.home', {}, {
								reload: true
							});
						} else {
							toastr.error("Not authorized", "Access Denied");
						}
					}, function(err) {
						if(err.message) {
							toastr.error(err.message, "Error");
						} else {
							toastr.error("Invalid credentials.", "Error");
						}
					})
			}
		}
	])