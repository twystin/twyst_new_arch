angular.module('merchantApp').controller('MenuCreateController', ['$scope', 'merchantRESTSvc', 'toastr', 'WizardHandler', '$timeout', '$state', '$q', '$modal',
	function($scope, merchantRESTSvc, toastr, WizardHandler, $timeout, $state, $q, $modal) {
		$scope.menu = {
			status: 'active',
			menu_categories: []
		};
		
		$scope.current_category = '';

		$scope.menu_types = ['Dine-In', 'Takeaway', 'Delivery', 'Weekend', 'Dinner', 'All'];
		
		$scope.addMenuCategory = function() {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuCategoryTemplate.html',
				controller: 'MenuCategoryController',
				size: 'lg',
				resolve: {
					menu_category: function() {
						return {
							sub_categories: [{
								sub_category_name: 'Default',
								items: []
							}]
						};
					},
					is_new: function() {
						return true;
					}
				}
			});

			modalInstance.result.then(function(category) {
				$scope.menu.menu_categories.push(category);
			});
		}

		$scope.showCategory = function(index) {
			if(!$scope.menu.menu_categories[index]) {
				toastr.error("Menu category out of bounds");
			} else {
				$scope.current_category = index;
				delete $scope.visible_item;
			}
		}

		$scope.addItem = function(sub_category) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuItemTemplate.html',
				controller: 'MenuItemController',
				size: 'lg',
				resolve: {
					item: function() {
						return {
							options: [],
							item_availability: {
								regular_item: true
							},
							item_available_on: [],
							is_vegetarian: true,
							option_is_addon: false,
							is_available: true
						};
					},
					is_new: function() {
						return true;
					}
				}
			});

			modalInstance.result.then(function(item) {
				sub_category.items.push(item);
			});
		}

		$scope.editItem = function(sub_category, index) {
			if(!sub_category || !sub_category.items || !sub_category.items[index]) {
				toastr.error("Item out of bounds");
			} else {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'menuItemTemplate.html',
					controller: 'MenuItemController',
					size: 'lg',
					resolve: {
						item: function() {
							return _.clone(sub_category.items[index] || {options: []});
						},
						is_new: function() {
							return false;
						}
					}
				});

				modalInstance.result.then(function(item) {
					sub_category.items[index] = item;
				}, function() {
					console.log('Modal dismissed at: ', new Date());
				});
			}
		}

		$scope.addSubCategory = function(index) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'subCategoryTemplate.html',
				controller: 'MenuSectionController',
				size: 'lg',
				resolve: {
					sub_category: function() {
						return {
							items: []
						};
					},
					is_new: function() {
						return true
					}
				}
			});

			modalInstance.result.then(function(sub_category) {
				$scope.menu.menu_categories[index].sub_categories.push(sub_category);
			});

		}

		$scope.editCategory = function(index) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuCategoryTemplate.html',
				controller: 'MenuCategoryController',
				size: 'lg',
				resolve: {
					menu_category: function() {
						return _.clone($scope.menu.menu_categories[index] || {sub_categories: []});
					},
					is_new: function() {
						return false;
					}
				}
			});

			modalInstance.result.then(function(category) {
				$scope.menu.menu_categories[index] = category;
			});
		}

		$scope.editSubCategory = function(category, index) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'subCategoryTemplate.html',
				controller: 'MenuSectionController',
				size: 'lg',
				resolve: {
					sub_category: function() {
						return _.clone(category.sub_categories[index] || {items: []});
					},
					is_new: function() {
						return false
					}
				}
			});

			modalInstance.result.then(function(sub_category) {
				$scope.menu.menu_categories[index].sub_categories[index] = sub_category;
			});
		}

		merchantRESTSvc.getOutlets().then(function(res) {
			$scope.outlets = res.data.outlets;
		}, function(err) {
			$scope.outlets = [];
			console.log(err);
		})

		$scope.reviewMenu = function() {
			var deferred = $q.defer();
			if (!$scope.menu.menu_type) {
				deferred.reject('Menu Type required');
			} else if (!$scope.menu.outlet) {
				deferred.reject('Outlet id required');
			} else {
				async.each($scope.menu.menu_categories, function(category, callback) {
					if(!category.category_name) {
						callback('Menu category name required');
					} else if (!category.sub_categories || !category.sub_categories.length) {
						callback('All menu categories must have atleast one section');
					} else {
						async.each(category.sub_categories, function(sub_category, callback) {
							if (!sub_category.sub_category_name) {
								callback('All sections must have a section name');
							} else if (!sub_category.items || !sub_category.items.length) {
								callback('All sections must have atleast one item');
							} else {
								callback();
							}
						}, function(err) {
							callback(err);
						});
					}
				}, function(err) {
					if(err) {
						deferred.reject(err)
					} else {
						deferred.resolve(true);
					}
				});
			}
			return deferred.promise;
		}

		$scope.createMenu = function() {
			$scope.reviewMenu().then(function() {
				merchantRESTSvc.createMenu($scope.menu).then(function(res) {
					console.log(res);
					toastr.success("Menu created successfully");
					$timeout(function() {
						$state.go('merchant.menus', {}, {
							reload: true
						});
					}, 800);
				}, function(error) {
					console.log(error);
					if(error.message) {
						toastr.error(error.message, "Error");
					} else {
						toastr.error("Something went wrong", "Error");
					}
				});
			}, function(err) {
				toastr.error(err);
			});
		}

		$scope.showItem = function(item) {
			$scope.visible_item = item;
		}

	}
]);