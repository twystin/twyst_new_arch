angular.module('merchantApp')
	.controller('RootController', ['$scope', '$rootScope', '$state', 'merchantRESTSvc', '$log', 'toastr', '$cookies', 
		function($scope, $rootScope, $state, merchantRESTSvc, $log, toastr, $cookies) {
			if(!$rootScope.token && ($state.current.name !== 'merchant.login')) {
				$state.go('merchant.login', {}, {
					reload: true
				});
			}

			$scope.logout = function() {
				merchantRESTSvc.logout().then(function(data) {
					if(data.response) {
						$cookies.remove('token');
						$rootScope.token = undefined;
						toastr.success("Logged out successfully");
						$state.go('merchant.login', {}, {
							reload: true
						});
					} else {
						$log.log('logout failure', data);
						toastr.error(data.message, "Error");
					}
				}, function(err) {
					$log.log('logout failure', err);
					if(err.message) {
						toastr.error(err.message, "Error");
					}
				});
			}
		}
	])