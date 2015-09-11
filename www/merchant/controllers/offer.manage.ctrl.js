angular.module('merchantApp')	
	.controller('OfferManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {

			$scope.offers = {
				'checkin': [],
				'offer': [],
				'deal': [],
				'bank_deal': []
			}

			$scope.offer_groups = [];
			$scope.get_offers = function() {
				merchantRESTSvc.getOutlets().then(function(data) {
					$scope.outlets = data.data.outlets;
					_.each($scope.outlets, function(outlet) {
						_.each(outlet.offers, function(offer) {
							if($scope.offer_groups.indexOf(offer.offer_group)==-1) {
								$scope.offer_groups.push(offer.offer_group);
								if(offer.offer_type) {
									$scope.offers[offer.offer_type].push(offer);
								} else {
									$scope.offers['checkin'].push(offer);
								}
							}
						})
					})
				}, function(err) {
					$log.log('Could not get outlets - ' + err.message);
					$scope.outlets = [];
				});
			}
			

			$scope.removeOffer = function(index) {
				if(confirm("This is an irreversable change. Do you wish to continue?")) {
					
				}
			}
		}
	])