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
						$cookies.put('token', res.data.data);
						$rootScope.token = res.data.data;
						toastr.success("Logged in successfully");
						$state.go('console.home', {}, {
							reload: true
						});
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