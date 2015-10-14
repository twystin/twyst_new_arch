angular.module('consoleApp')
	.controller('MerchantManageController', ['$scope', 'toastr', 'consoleRESTSvc',
		function($scope, toastr, consoleRESTSvc) {

			$scope.current_page = 1;
			$scope.per_page = 10;

			$scope.loadMerchants = function() {
				consoleRESTSvc.getMerchantAccounts().then(function(data) {
					console.log(data);
					$scope.merchants = data.data;
					$scope.visible_merchants = $scope.merchants.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
					$scope.merchant_count = $scope.merchants.length;
					console.log(data);
				}, function(err) {
					console.log(err);
				});
			}

			$scope.filterMerchants = function(reset_page) {
				if(reset_page) {
					$scope.current_page = 1;
				}
				if (!$scope.merchantFilter) {
					$scope.visible_merchants = $scope.merchants.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
					$scope.merchant_count = $scope.merchants.length;
				} else {
					var regex = new RegExp($scope.merchantFilter, 'i');
					var filtered_merchants = _.filter($scope.merchants, function(merchant) {
						return regex.test(merchant.username);
					});
					$scope.merchant_count = filtered_merchants.length;
					$scope.visible_merchants = filtered_merchants.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
				}
			}


		}
	])