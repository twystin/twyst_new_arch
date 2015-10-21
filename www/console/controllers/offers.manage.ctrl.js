angular.module('consoleApp').controller('OfferManageController', ['$scope', 'toastr', 'consoleRESTSvc',
	function($scope, toastr, consoleRESTSvc) {
		$scope.current_page = 1;
		$scope.per_page = 12;

		$scope.loadOffers = function() {
			consoleRESTSvc.getAllOffers().then(function(data) {
				console.log(data);
				$scope.offers = data.data;
				$scope.visible_offers = $scope.offers.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
				$scope.offerCount = $scope.offers.length;
			}, function(err) {
				console.log(err);
			});
		}

		$scope.filterOffers = function(reset_page) {
			if (reset_page) {
				$scope.current_page = 1;
			}

			if (!$scope.offerFilter) {
				$scope.visible_offers = $scope.outlets.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
				$scope.offerCount = $scope.offers.length;
			} else {
				var regex = new RegExp($scope.offerFilter, 'i');
				var filtered_offers = _.filter($scope.offers, function(offer) {
					return regex.test(offer._id) || regex.test(offer.actions.reward.header) || regex.test(offer.actions.reward.line1) || regex.test(offer.actions.reward.line2) || regex.test(offer.offer_status);
				});
				$scope.offerCount = filtered_offers.length;
				$scope.visible_offers = filtered_offers.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
			}
		}

		$scope.updateOfferStatus = function(offer) {
			consoleRESTSvc.updateOfferStatus(offer)
				.then(function(res) {
					console.log(res);
					toastr.success("Offer status updated")
				}, function(err) {
					if(err.message) {
						toastr.error(err.message);
					} else {
						toastr.error("Unable to update the offer status right now");
					}
					console.log(err);
				});
		}
	}
])