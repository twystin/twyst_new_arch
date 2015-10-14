angular.module('consoleApp')
	.controller('SuggestedOutletsController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {
			$scope.sort_order = {
				'event_date': 'Oldest First',
				'-event_date': 'Newest FIrst'
			};

			$scope.view_options = ['submitted', 'declined', 'accepted'];

			$scope.sort = 'event_date';
			$scope.view_by = 'submitted';

			$scope.loadSuggestions = function() {
				consoleRESTSvc.getEvents('suggestion', $scope.view_by, $scope.sort).then(function(res) {
					console.log(res);
					$scope.suggestions = res.data;
				}, function(err) {
					console.log(err);
				});
			}

			$scope.updateSortOrder = function(sort) {
				$scope.sort = sort;
				$scope.loadSuggestions();
			}

			$scope.updateViewBy = function(val) {
				$scope.view_by = $scope.view_options[val];
				$scope.loadSuggestions();
			}
		}
	]);