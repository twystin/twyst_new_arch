angular.module('merchantApp')	
	.controller('OfferManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {
			$scope.get_offers = function() {
				
			}

			$scope.removeOffer = function(index) {
				if(confirm("This is an irreversable change. Do you wish to continue?")) {
					
				}
			}
		}
	])