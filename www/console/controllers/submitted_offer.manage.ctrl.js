angular.module('consoleApp').controller('SubmittedOffersController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', 
	function($scope, toastr, consoleRESTSvc, $log) {
		$scope.sort_order = {
			'event_date': 'Oldest First',
			'-event_date': 'Newest FIrst'
		};

		$scope.view_options = ['submitted', 'declined', 'accepted'];

		$scope.sort = 'event_date';
		$scope.view_by = 'submitted';

		$scope.loadSubmittedOffers = function() {
			consoleRESTSvc.getEvents('submit_offer', $scope.view_by, $scope.sort).then(function(data) {
				console.log(data);
				$scope.submitted_offers = data.data;
			}, function(err) {
				console.log(err);
			});
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