angular.module('consoleApp').controller('SubmittedOffersController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', 
	function($scope, toastr, consoleRESTSvc, $log) {
		$scope.current_page = 1;
		$scope.per_page = 12;

		$scope.sort_order = {
			'event_date': 'Oldest First',
			'-event_date': 'Newest FIrst'
		};

		$scope.view_options = ['submitted', 'twyst_approved', 'twyst_rejected'];

		$scope.sort = 'event_date';
		$scope.view_by = 'submitted';

		$scope.loadSubmittedOffers = function() {
			consoleRESTSvc.getEvents('submit_offer', $scope.view_by, $scope.sort).then(function(data) {
				console.log(data);
				$scope.submitted_offers = data.data;
				$scope.visible_submitted_offers = $scope.submitted_offers.slice(($scope.current_page - 1) * $scope.per_page, $scope.current_page * $scope.per_page);
				$scope.submittedOffersCount = $scope.submitted_offers.length;
			}, function(err) {
				console.log(err);
			});
		}

		$scope.filterSubmittedOffers = function(reset_page) {
			if(reset_page) {
				$scope.current_page = 1;
			}

			if(!$scope.submittedOffersFilter) {
				$scope.visible_submitted_offers = $scope.submitted_offers.slice(($scope.current_page - 1) * $scope.per_page, $scope.current_page * $scope.per_page);
				$scope.submittedOffersCount = $scope.submitted_offers.length;
			} else {
				var regex = new RegExp($socpe.submittedOffersFilter, 'i');
				var filteredSubmitted = _.filter($scope.submitted_offers, function(offer) {
					return regex.test(offer.event_user.phone) || regex.test(offer.event_meta.offer) || regex.text(offer.event_meta.outlet) || regex.test(offer.event_meta.location);
				});
				$scope.submittedOffersCount = filteredSubmitted.length;
				$scope.visible_submitted_offers = filteredSubmitted.slice(($scope.current_page - 1) * $scope.per_page, $scope.current_page * $scope.per_page);
			}
		}

		$scope.updateSortOrder = function(sort) {
			$scope.sort = sort;
			$scope.loadSubmittedOffers();
		}

		$scope.updateViewBy = function(val) {
			$scope.view_by = $scope.view_options[val];
			$scope.loadSubmittedOffers();
		}
	}
]);