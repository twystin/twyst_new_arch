angular.module('consoleApp').controller('OrderManageController', ['$scope', 'consoleRESTSvc', '$filter',
	function($scope, consoleRESTSvc, $filter) {

		$scope.searchKeywords = '';

		$scope.orders = [];

		$scope.filtered_orders = [];

		$scope.row = '';

		$scope.numPerPageOpt = [5, 10, 20, 40];

		$scope.numPerPage = $scope.numPerPageOpt[1];

		$scope.currentPage = 1;

		$scope.currnet_page_orders = [];

		consoleRESTSvc.getOrders().then(function(res) {
			console.log(res);
		}, function(err) {
			console.log(err);
		});

		$scope.select = function(page) {
			var end, start;
			start = (page - 1) * $scope.numPerPage;
			end = start + $scope.numPerPage;
			return $scope.currnet_page_orders = $scope.filtered_orders.slice(start, end);
		};

		$scope.onFilterChange = function() {
			$scope.select(1);
			$scope.currentPage = 1;
			return $scope.row = '';
		};

		$scope.onNumPerPageChange = function() {
			$scope.select(1);
			return $scope.currentPage = 1;
		};

		$scope.onOrderChange = function() {
			$scope.select(1);
			return $scope.currentPage = 1;
		};

		$scope.search = function() {
			$scope.filtered_orders = $filter('filter')($scope.orders, $scope.searchKeywords);
			if ($scope.view_status) {
				$scope.sort($scope.view_status);
			}
			return $scope.onFilterChange();
		};

		$scope.order = function(rowName) {
			if ($scope.row === rowName) {
				return;
			}

			$scope.row = rowName;
			$scope.filtered_orders = $filter('orderBy')($scope.orders, rowName);
			if ($scope.view_status) {
				$scope.sort($scope.view_status);
			}
			$scope.onOrderChange();
		};

		$scope.sort = function(sort_by) {
			if ($scope.row) {
				$scope.filtered_orders = $filter('orderBy')($scope.offers, $scope.row);
			} else {
				$scope.filtered_orders = $scope.orders;
			}
			$scope.filtered_orders = _.filter($scope.filtered_orders, function(order) {
				return order.order_status.indexOf(sort_by) !== -1;
			});
			$scope.onFilterChange();
		};
	}
])