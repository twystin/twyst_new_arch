angular.module('merchantApp')
	.controller('MenuManageController', ['$scope', 'merchantRESTSvc', '$log', 'toastr', '$modal',
		function($scope, merchantRESTSvc, $log, toastr, $modal) {
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
						$scope.getMenus();
					}, function(err) {
						console.log(err);
					});
				}
			}

			$scope.cloneMenu = function(index) {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'cloneMenuTemplate.html',
					controller: 'CloneMenuController',
					size: 'lg',
					resolve: {
						menu: function() {
							return $scope.menus[index]._id
						}
					}
				});

				modalInstance.result.then(function() {
					// console.info('Modal dismissed at: ' + new Date());
					toastr.success('Menu cloned successfully');
					$scope.getMenus();
				}, function(err) {
					console.info('Modal dismissed at: ' + new Date());
					console.log(err);
				})
			}

			
		}
	]).controller('CloneMenuController', function($scope, $modalInstance, menu, merchantRESTSvc, toastr) {
		$scope.req_obj = {
			menu: menu
		}

		merchantRESTSvc.getOutlets().then(function(data) {
			console.log(data);
			$scope.outlets = data.data.outlets;
		}, function(err) {
			console.log(err);
		});

		$scope.cloneMenu = function() {
			if (!$scope.req_obj.outlet) {
				toastr.error('Please select an outlet first');
			} else {
				merchantRESTSvc.cloneMenu(menu, $scope.req_obj.outlet).then(function(data) {
					$modalInstance.close();
				}, function(err) {
					$modalInstance.dismiss(err);
				});
			}
			// console.log(menu, $scope.req_obj.outlet);
			// merchantRESTSvc.clone(menu, $scope.req_obj.outlet).then(function(data) {
			// 	modalInstance.close();
			// }, function(err) {
			// 	modalInstance.dismiss(err);
			// })
		}

	})