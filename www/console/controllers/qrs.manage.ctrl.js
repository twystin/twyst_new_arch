angular.module('consoleApp').controller('QRListController', ['$scope', 'toastr', 'consoleRESTSvc', 
		function($scope, toastr, consoleRESTSvc) {

			$scope.current_page = 1;
			$scope.per_page = 50;

			$scope.loadQRs = function() {
				consoleRESTSvc.getQRs().then(function(data) {
					console.log(data);
					$scope.qrs = data.data;
					$scope.visible_qrs = $scope.qrs.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
					$scope.qrCount = $scope.qrs.length;
				}, function(err) {
					console.log(err);
				});
			}

			$scope.filterQrs = function(reset_page) {
				if(reset_page) {
					$scope.current_page = 1;
				}
				if(!$scope.qrFilter) {
					$scope.visible_qrs = $scope.qrs.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
					$scope.qrCount = $scope.qrs.length;
				} else {
					var regex = new RegExp($scope.qrFilter, 'i');
					var filtered_qrs = _.filter($scope.qrs, function(qr) {
						return regex.test(qr.code) ||  regex.test(qr.outlet_id.basics.name) || regex.test(qr.outlet_id.contact.location.locality_1[0]) || regex.test(qr.outlet_id.contact.location.locality_2[0]);
					});
					$scope.qrCount = filtered_qrs.length
					$scope.visible_qrs = filtered_qrs.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
				}
			}


		}
	]);