angular.module('merchantApp')	
	.controller('OfferManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {

			_id = undefined;

			$scope.offer_ids = [];
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
							if($scope.offer_ids.indexOf(offer._id)==-1) {
								$scope.offer_ids.push(offer._id);
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
			

			$scope.removeOffer = function(offer_id) {
				if(confirm("This is an irreversable change. Do you wish to continue?")) {
					merchantRESTSvc.removeOffer(offer_id)
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