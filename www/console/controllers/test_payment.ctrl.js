angular.module('consoleApp')
	.controller('TestPaymentController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {

			$scope.calculate_checksum = function(){
				$scope.checksum = 'dbdb4097be1140c21f8953f7b9cc7029394d8d76b2d57529fccec001eb7c6c65';
			}

			
		}
	])