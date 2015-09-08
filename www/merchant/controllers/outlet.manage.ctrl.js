angular.module('merchantApp')	
	.controller('OutletManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {
			
			$scope.get_outlets = function() {
				merchantRESTSvc.getOutlets().then(function(data) {
					$scope.outlets = data.data.outlets;
				}, function(err) {
					$log.log('Could not get outlets - ' + err.message);
					$scope.outlets = [];
				});
			}

			$scope.removeOutlet = function(index) {
				if(confirm("This is an irreversable change. Do you wish to continue?")) {
					merchantRESTSvc.removeOutlet($scope.outlets[index]._id).then(function(data) {
						toastr.success('Outlet has been removed');
						$scope.outlets.splice(index, 1);
					}, function(err) {
						toastr.error("Unable to delete outlet at the moment", "Error");
					});
				}
			}
		}
	])