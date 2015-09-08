angular.module('merchantApp')	
	.controller('OutletManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {
			$scope.offers = {
				'checkin': [],
				'offer': [],
				'deal': [],
				'bank_deal': []
			}
			$scope.get_outlets = function() {
				merchantRESTSvc.getOutlets().then(function(data) {
					$scope.outlets = data.data.outlets;
					_.each($scope.outlets, function(outlet) {
						_.each(outlet.offers, function(offer) {
							offer.outletId = outlet._id;
							if(offer.offer_type) {
								$scope.offers[offer.offer_type].push(offer);
							} else {
								$scope.offers['checkin'].push(offer);
							}
						})
					})
				}, function(err) {
					$log.log('Could not get outlets - ' + err.message);
					$scope.outlets = [];
				});
			}

			$scope.removeOutlet = function(index) {
				if(confirm("This is an irreversable change. Do you wish to continue?")) {
					merchantRESTSvc.removeOutlet($scope.outlets[index]._id).then(function(data) {
						toastr.success('Outlet has been removed');
						$scope.outlets.splice(index, 1);
					}, function(err) {
						toastr.error("Unable to delete outlet at the moment", "Error");
					});
				}
			}
		}
	])