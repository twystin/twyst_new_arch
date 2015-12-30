angular.module('consoleApp')
	.controller('TestPaymentController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		function($scope, toastr, consoleRESTSvc, $log) {

			$scope.calculate_checksum = function(){
				$scope.checksum = '760ca41e7b42cccd0ad60eac129670db582ea71d1cf34f8eb0de26ce051a0392';
			}

			
		}
	])