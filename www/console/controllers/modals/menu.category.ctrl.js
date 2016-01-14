angular.module('consoleApp').controller('MenuCategoryController', function($scope, $modalInstance, category, is_new, SweetAlert) {
    $scope.menu_categories = ['Indian', 'Dessert', 'Cakes', 'Chinese', 'Soup'];

    $scope.is_new = is_new;
    $scope.category = category;

    $scope.resolveCategory = function() {
        if (!$scope.category.category_name) {
            SweetAlert.swal("Validation Error", "Category Name cannot be left blank", "error");
        } else {
            $modalInstance.close($scope.category);
        }
    };

    $scope.discardCategory = function() {
        $modalInstance.dismiss('Cancel');
    };
});
