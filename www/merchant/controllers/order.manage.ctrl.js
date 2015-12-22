angular.module('merchantApp')
	.controller('OrderManageController', ['$scope', 'merchantRESTSvc', 'SweetAlert', '$state', '$q', '$modal',
		function($scope, merchantRESTSvc, SweetAlert, $state, $q, $modal) {
			$scope.showing = "pending";

			$scope.updateShowing = function(text) {
				$scope.showing = text;
			};
			
		}
	]);