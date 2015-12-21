angular.module('merchantApp')
	.controller('MenuSubCategoryController', function($scope, $modalInstance, sub_category, is_new, SweetAlert) {

		$scope.is_new = is_new;
		$scope.sub_category = sub_category;
		$scope.sub_category_name = ['Veg Starter', 'Non-Veg Starter', 'Veg Main Course', 'Non-Veg Main Course'];

		$scope.resolveSubCategory = function() {
			if (!$scope.sub_category.sub_category_name) {
				SweetAlert.swal("Validation Error", "Sub category name cannot be left blank", "error");
			} else {
				$modalInstance.close($scope.sub_category);
			}
		};

		$scope.discardSubCategory = function() {
			$modalInstance.dismiss('Cancel');
		};
	});