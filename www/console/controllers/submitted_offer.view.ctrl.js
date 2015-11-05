angular.module('consoleApp')
	.controller('SubmittedOfferViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$stateParams',
			function($scope, toastr, consoleRESTSvc, $stateParams) {
				consoleRESTSvc.getEvent($stateParams.submitted_offer_id).then(function(data) {
					console.log(data);
					$scope.offer = data.data;
					console.log(data.data.event_outlet)
				}, function(err) {
					console.error(err);
				})

				$scope.updateCheck = function(flag, value) {
					$scope[flag] = value;
				}

				$scope.loadOffers = function() {
					consoleRESTSvc.getAllOffers().then(function(data) {
						console.log(data);
						$scope.offers = _.filter(data.data, function(offer) {
							return offer.offer_outlets.indexOf($scope.offer.event_outlet)!==-1 && offer.offer_user_source && offer.offer_user_source==$scope.offer.event_user;
						});
						console.log($scope.offers.length, data.data.length);
					}, function(err) {
						console.log(err);
					})
				}

				$scope.updateOutletId = function(item) {
					console.log(item);
					$scope.offer.event_meta.actual_offer = item._id;
				}


				$scope.processOffer = function() {
					console.log($scope.offer);
					if(!$scope.disable_input) {
						$scope.disable_input = true;
						var event = _.cloneDeep($scope.offer);
						event.event_meta.status = 'twyst_approved';
						delete event.event_meta.user;
						consoleRESTSvc.updateEvent(event).then(function(data) {
							$scope.disable_input = false;
							event.event_meta.user = $scope.offer.event_meta.user;
							$scope.offer = _.cloneDeep(event);
							toastr.success("Updated successfully", "Updated");
						}, function(err) {
							$scope.disable_input = false;
							if(err.message) {
								toastr.error(err.message, "Error");
							} else {
								toastr.error("Error occured while trying to update", "Error");
							}
						});
					}
				}

				$scope.rejectOffer = function() {
					if (!$scope.disable_input) {
						$scope.disable_input = true;
						var event = _.cloneDeep($scope.offer);
						event.event_meta.status = 'twyst_rejected';
						delete event.event_meta.user;
						if(!$scope.isValidInput) {
							event.event_meta.rejected = true;
							event.event_meta.reason = "Offer not valid for the outlet";
						} else if ($scope.offerOnTwyst) {
							event.event_meta.rejected = true;
							event.event_meta.reason = "Offer already on Twyst";
						}
						consoleRESTSvc.updateEvent(event).then(function(data) {
							$scope.disable_input = false;
							event.event_meta.user = $scope.offer.event_meta.user;
							$scope.offer = _.cloneDeep(event);
							toastr.success("Updated successfully", "Updated");
						}, function(err) {
							$scope.disable_input = false;
							if(err.message) {
								toastr.error(err.message, "Error");
							} else {
								toastr.error("Error occured while trying to update", "Error");
							}
						})
					}
				}
			}
		])