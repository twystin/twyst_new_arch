angular.module('merchantApp').controller('MenuCloneController', function($scope, $modalInstance, menu_id, outlet_id, SweetAlert, merchantRESTSvc) {
    $scope.req_obj = {
        menu: menu_id
    };

    merchantRESTSvc.getOutlets().then(function(data) {
        $scope.outlets = _.filter(data.data.outlets, function(outlet) {
            return outlet._id !== outlet_id;
        });
    }, function(err) {
    	$scope.outlets = [];
        console.log(err);
    });

    $scope.cloneMenu = function() {
        if (!$scope.req_obj.outlet) {
            SweetAlert.swal('Error!', 'Please select an outlet first', 'error');
        } else {
            merchantRESTSvc.cloneMenu(menu_id, $scope.req_obj.outlet).then(function(data) {
                $modalInstance.close();
            }, function(err) {
                var message = err.message?err.message:'Unable to clone the menu right now';
                SweetAlert.swal({
					title: 'Service error',
					text: message,
					type: 'error',
					showCancelButton: false,
					confirmButtonColor: "#DD6B55",
					confirmButtonText: 'Continue',
					closeOnConfirm: true
				}, function() {
					$modalInstance.dismiss();
				});
            });
        }
    };

    $scope.cancel = function() {
    	$modalInstance.dismiss('Cancel');
    };
});
