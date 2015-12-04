angular.module('merchantApp').controller('MenuEditController', ['$scope', 'merchantRESTSvc', 'toastr', 'WizardHandler', '$stateParams', '$state', '$timeout', '$q', '$modal',
	function($scope, merchantRESTSvc, toastr, WizardHandler, $stateParams, $state, $timeout, $q, $modal) {
		$scope.menu = {
			status: 'active',
			menu_categories: []
		};

		merchantRESTSvc.getMenu($stateParams.menu_id).then(function(res) {
			$scope.menu = res.data;
		}, function(err) {
			$scope.menu = {};
			console.log(err);
		})

		$scope.showCategory = function(index) {
			if(!$scope.menu.menu_categories[index]) {
				toastr.error("Menu category out of bounds");
			} else {
				$scope.current_category = index;
				delete $scope.visible_item;
			}
		}

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

		merchantRESTSvc.getOutlets().then(function(res) {
			$scope.outlets = res.data.outlets;
		}, function(err) {
			$scope.outlets = [];
			console.log(err);
		})

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

			modalInstance.result.then(function(section) {
				$scope.menu.menu_categories[index].sub_categories.push(section);
			}, function() {
				console.log('Modal dismissed at: ', new Date());
			})
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
				category.sub_categories[index] = sub_category;
			});
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
							is_vegetarian: false,
							option_is_addon: false,
							item_is_available: true
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

		$scope.updateMenu = function() {
			$scope.reviewMenu().then(function() {
				merchantRESTSvc.updateMenu($scope.menu).then(function(res) {
					console.log(res);
					toastr.success("Menu updated successfully");
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
			})
		}

		$scope.showItem = function(item) {
			$scope.visible_item = item;
		}

	}
]).controller('MenuCategoryController', function($scope, $modalInstance, menu_category, is_new) {
	$scope.menu_categories = ['Indian', 'Desserts', 'Cakes', 'Chinese', 'Soup'];

	$scope.is_new = is_new;
	$scope.current_category = menu_category;

	$scope.resolveCategory = function() {
		$modalInstance.close($scope.current_category);
	}

	$scope.discardCategory = function() {
		$modalInstance.dismiss('cancel');
	}
	console.log(menu_category, is_new);
}).controller('MenuSectionController', function($scope, $modalInstance, sub_category, is_new) {
	$scope.section_names = ['Veg Starters', 'Non Veg Starters', 'Veg Main Course', 'Non Veg Main Course'];

	$scope.is_new = is_new;
	$scope.current_sub_category = sub_category;

	$scope.resolveSection = function() {
		$modalInstance.close($scope.current_sub_category);
	}

	$scope.discardSection = function() {
		$modalInstance.dismiss('cancel');
	}
}).controller('MenuItemController', function($scope, $modalInstance, toastr, item, is_new, $q) {
	$scope.is_new = is_new;
	$scope.current_item = item;

	$scope.addOptionSet = function() {
		$scope.current_item.options.push({option_is_available: true, sub_options: [], addons: []});
	}

	$scope.addSubVariant = function(option) {
		option.sub_options.push({sub_option_set: []})
	}

	$scope.addSubOptionPair = function(sub_option) {
		sub_option.sub_option_set.push({sub_option_is_available: true});
	}

	$scope.removeSubOption = function(option, index) {
		option.sub_options.splice(index, 1);
	}

	$scope.removeSubOptionObj = function(sub_option, $index) {
		sub_option.sub_option_set.splice($index, 1);
	}

	$scope.removeOption = function(index) {
		$scope.current_item.options.splice(index, 1);
	}

	$scope.addAddonSet = function(option) {
		option.addons.push({addon_set: []});
	}

	$scope.removeAddon = function(option, index) {
		option.addons.splice(index, 1);
	}

	$scope.addAddonObj = function(addon) {
		addon.addon_set.push({addon_is_available: true});
	}

	$scope.removeAddonObj = function(addon, index) {
		addon.addon_set.splice(index, 1);
	}

	$scope.removeAddon = function(option, index) {
		if(!option || !option.addons || !option.addons[index]) {
			toastr.error('Addon out of bounds');
		} else {
			option.addons.splice(index, 1);
		}
	}

	$scope.resolveItem = function() {
		$scope.validateItem().then(function() {
			$modalInstance.close($scope.current_item);	
		}, function(err) {
			toastr.error(err);
		});
	}

	$scope.discardItem = function() {
		$modalInstance.dismiss('cancel');
	}

	$scope.validateItem = function() {
		var deferred = $q.defer();
		if (!$scope.current_item.item_name) {
			deferred.reject('Item name is mandatory');
		} else if (!$scope.current_item.item_tags || !$scope.current_item.item_tags.length) {
			deferred.reject('Atleast one item tag is required');
		} else if (!$scope.current_item.item_cost && $scope.current_item.item_cost !== 0) {
			deferred.reject("Base cost is mandatory");
		} else {
			async.each($scope.current_item.options, function(option, callback) {
				console.log(option);
				if (!option.option_value) {
					callback("All item option sets must have a valid value")
				} else if (!option.option_cost && option.option_cost !== 0) {
					callback("All item option sets must have a valid cost");
				} else {
					async.each(option.sub_options, function(sub_option, callback) {
						if(!sub_option.sub_option_title) {
							callback("All sub variant sets must have valid headers");
						} else if ((!sub_option.sub_option_set || sub_option.sub_option_set.length === 0)) {
							callback("Atleast one key-value pair required for all sub variant sets");
						} else {
							async.each(sub_option.sub_option_set, function(sub_option_obj, callback) {
								console.log(sub_option_obj);
								if (!sub_option_obj.sub_option_value) {
									callback("All sub variant sets must have valid value");
								} else if (!sub_option_obj.sub_option_cost && !sub_option_obj.sub_option_cost) {
									callback("All sub variant sets must have valid cost");
								} else {
									async.each(option.addons, function(addon, callback) {
										if (!addon.addon_title) {
											callback("All addon sets must have valid title");
										} else if (!addon.addon_set || addon.addon_set.length === 0) {
											callback('All addons must have atleast one key-value pair');
										} else {
											async.each(addon.addon_set, function(addon_obj, callback) {
												if (!addon_obj.addon_value) {
													callback("All addons must have valid value");
												} else if (!addon_obj.addon_cost && addon_obj.addon_cost !== 0) {
													callback("Add addons must have valid cost");
												} else {
													callback();
												}
											}, function(err) {
												callback(err);
											});
										}
									}, function(err) {
										callback(err);
									})
								}
							}, function(err) {
								callback(err);
							})
						}
					}, function(err) {
						callback(err);
					});
				}
			}, function(err) {
				if(err) {
					deferred.reject(err);
				} else {
					deferred.resolve();
				}
			});
		}
		return deferred.promise;
	}
})