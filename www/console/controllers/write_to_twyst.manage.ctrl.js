angular.module('consoleApp')
	.controller('WriteToTwystController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {
			$scope.sort_order = {
				'event_date': 'Oldest First',
				'-event_date': 'Newest FIrst'
			};

			$scope.view_options = ['submitted', 'processed',];

			$scope.sort = 'event_date';
			$scope.view_by = 'submitted';

			$scope.loadWriteToTwyst = function() {
				consoleRESTSvc.getEvents('write_to_twyst', $scope.view_by, $scope.sort).then(function(res) {
					console.log(res);
					$scope.write_to_twyst = res.data;
				}, function(err) {
					console.log(err);
				});
			}

			$scope.updateSortOrder = function(sort) {
				$scope.sort = sort;
				$scope.loadWriteToTwyst();
			}

			$scope.updateViewBy = function(val) {
				$scope.view_by = $scope.view_options[val];
				$scope.loadWriteToTwyst();
			}
		}
	]);