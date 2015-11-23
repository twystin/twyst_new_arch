angular.module('merchantApp')
	.controller('MenuManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr',
		function($scope, merchantRESTSvc, $log, toastr) {
			$scope.getMenus = function() {
				merchantRESTSvc.getAllMenus().then(function(res) {
					$scope.menus = res.data;
					toastr.success("Menus loaded successfully");
				}, function(err) {
					$scope.menus = [];
					if(err.message) {
						toastr.error(err.message, "Error");
					} else {
						toastr.error("Something went wrong", "Error");
					}
				})
			}

			$scope.deleteMenu = function(menu_id) {
				if(confirm("Are you sure you want to delete?")) {
					merchantRESTSvc.deleteMenu(menu_id).then(function(res) {
						console.log(res);
					}, function(err) {
						console.log(err);
					});
				}
			}
		}
	])