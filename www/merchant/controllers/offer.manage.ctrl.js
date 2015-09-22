angular.module('merchantApp')	
	.controller('OfferManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {

			_id = undefined;

			$scope.offer_groups = [];
			$scope.get_offers = function() {
				$scope.offers = {
					'checkin': [],
					'offer': [],
					'deal': [],
					'bank_deal': []
				};
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
			

			$scope.removeOffer = function(offer_group) {
				if(confirm("This is an irreversable change. Do you wish to continue?")) {
					merchantRESTSvc.removeOffer(offer_group)
						.then(function(data) {
							toastr.success(data.message);
							$scope.get_offers();
						}, function(err) {
							console.log('error', err);
						});
				}
			}
		}
	])