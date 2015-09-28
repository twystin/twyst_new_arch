angular.module('merchantApp')
	.controller('BaseController', ['$scope', '$cookies', '$log', '$state', 'toastr', '$rootScope', 'merchantRESTSvc', '$stateParams', 
		function($scope, $cookies, $log, $state, $toastr, $rootScope, merchantRESTSvc, $stateParams) {

			_id = undefined;
			if($state.current.name==="merchant.default") {
				$state.go('merchant.panel', {}, {
					reload: true
				});
			}

			
		}
	])