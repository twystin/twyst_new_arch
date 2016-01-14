angular.module('consoleApp').controller('MenuOptionController', function($scope, $modalInstance, option, is_new, limit_access, option_title, SweetAlert) {

    $scope.is_new = is_new;
    $scope.option = option;
    $scope.option_title = option_title;
    $scope.limit_access = limit_access;

    $scope.resolveOption = function() {
        if (!$scope.option.option_value) {
            SweetAlert.swal("Validation Error", 'Option name required', 'error');
        } else if (!$scope.option.option_cost && $scope.option.option_cost !== 0) {
            SweetAlert.swal("Validation Error", 'Option cost required', 'error');
        } else {
            $modalInstance.close($scope.option);
        }
    };

    $scope.discardOption = function() {
        $modalInstance.dismiss('Cancel');
    };
});
