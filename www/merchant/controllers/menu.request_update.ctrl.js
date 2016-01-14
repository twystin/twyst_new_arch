angular.module('merchantApp').controller('MenuRequestUpdateController', function($scope, $modalInstance, merchantRESTSvc, menu_id, outlet, menu_type, SweetAlert) {

    $scope.update_request = {
        event_meta: {
            menu_id: menu_id,
            outlet: outlet,
            menu_type: menu_type,
            status: 'pending'
        }
    };

    $scope.submitRequest = function() {
        if (!$scope.update_request.event_meta.comment) {
            SweetAlert.swal("Validation Error", "Please input the changes required", "error");
        } else {
            merchantRESTSvc.menuUpdateRequest($scope.update_request).then(function(res) {
                console.log(res);
                SweetAlert.swal({
                    title: 'Request submitted',
                    text: 'Menu update request submitted successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Continue',
                    closeOnConfirm: true
                }, function() {
                    $modalInstance.close();
                });
            }, function(err) {
                console.log(err);
                SweetAlert.swal({
                    title: 'ERROR',
                    text: err.message ? err.message : 'Something went wrong. Please try after sometime',
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Continue',
                    closeOnConfirm: true
                }, function() {
                    $modalInstance.close();
                });
            })
        }
    };
});
