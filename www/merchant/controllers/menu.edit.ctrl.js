angular.module('merchantApp').controller('MenuEditController', ['$scope', 'merchantRESTSvc', 'toastr', 'WizardHandler', '$stateParams', '$state', '$timeout', '$q', '$modal',
	function($scope, merchantRESTSvc, toastr, WizardHandler, $stateParams, $state, $timeout, $q, $modal) {
		$scope.menu = {
			status: 'draft',
			menu_description: []
		};

		merchantRESTSvc.getMenu($stateParams.menu_id).then(function(res) {
			$scope.menu = res.data;
		}, function(err) {
			$scope.menu = {};
			console.log(err);
		})

		// $scope.menu = {"status":"draft","menu_description":[{"sections":[{"items":[{"item_options":[{"add_on":[{"add_on_item":"sfvss","add_on_item_cost":"342"}],"option":"fvr","option_cost":546}],"item_name":"wd","item_description":"df","item_tags":["sdf","fre","yt"],"item_cost":345}],"section_name":"asd","section_description":"ads"}],"menu_category":"asd"}],"menu_type":"asd", "outlet": "556568e81ade70eb1974b956"};

		$scope.menu_types = ['Dine-In', 'Takeaway', 'Delivery', 'Weekend', 'Dinner', 'All'];
		$scope.menu_categories = ['Indian', 'Desserts', 'Cakes', 'Chinese', 'Soup'];
		$scope.section_names = ['Veg Starters', 'Non Veg Starters', 'Veg Main Course', 'Non Veg Main Course'];

		$scope.addMenuCategory = function() {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuCategoryTemplate.html',
				controller: 'MenuCategoryController',
				size: 'lg',
				resolve: {
					menu_category: function() {
						return {
							sub_categories: [{sub_category_name: 'Default', items: []}]
						};
					},
					is_new: function() {
						return true
					}
				}
			});

			modalInstance.result.then(function(category) {
				$scope.menu.menu_categories.push(category);
			}, function() {
				console.log('Modal dismissed at: ', new Date());
			});
		}

		merchantRESTSvc.getOutlets().then(function(res) {
			$scope.outlets = res.data.outlets;
		}, function(err) {
			$scope.outlets = [];
			console.log(err);
		})

		$scope.manageCategory = function(index) {
			if(!$scope.menu.menu_categories || !$scope.menu.menu_categories[index]) {
				toastr.error("Menu category out of bounds");
			} else {
				$scope.descIndex = index;
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
							return false
						}
					}
				});

				modalInstance.result.then(function(category) {
					$scope.menu.menu_categories[$scope.descIndex] = category;
				}, function() {
					console.log('Modal dismissed at: ', new Date());
				});
			}
		}

		$scope.removeCategory = function(index) {
			if(confirm('Are you sure?')) {
				$scope.menu.menu_categories.splice(index, 1);
			}
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
				templateUrl: ''
			})
		}

		$scope.manageSubCategory = function(category, index) {
			if(!category || !category.sub_categories || !category.sub_categories[index]) {
				toastr.error("Section out of bounds");
			} else {
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
							return false;
						}
					}
				});

				modalInstance.result.then(function(sub_category) {
					category.sub_categories[index] = sub_category;
				}, function() {
					console.log('Modal dismissed at: ', new Date());
				});
			}
		}

		$scope.removeSubCategory = function(menu_category, index) {
			if(confirm('Are you sure?')) {
				if(menu_category && menu_category.sub_categories && menu_category.sub_categories[index]) {
					menu_category.sub_categories.splice(index, 1);
				} else {
					toastr.error('Section out of bounds');
				}
			}
		}

		$scope.addItem = function(section) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuItemTemplate.html',
				controller: 'MenuItemController',
				size: 'lg',
				resolve: {
					item: function() {
						return {option_sets: []};
					},
					is_new: function() {
						return true;
					}
				}
			});

			modalInstance.result.then(function(item) {
				section.items.push(item);
			}, function() {
				console.log('Modal dismissed at: ', new Date());
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
							return _.clone(sub_category.items[index] || {option_sets: []});
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

		$scope.deleteItem = function(section, index) {
			if(confirm("Are you sure?")) {
				if(section && section.items && section.items[index]) {
					section.items.splice(index, 1);
				} else {
					toastr.error("Iten out of bounds");
				}
			}
		}

		$scope.addItemOption = function(index) {
			$scope.current_item.item_options.push({add_on: []});
		}

		$scope.removeItemOption = function(index) {
			if(confirm('Are you sure?')) {
				$scope.current_item.item_options.splice(index, 1);
			}
		}

		$scope.addAddon = function(index) {
			$scope.current_item.item_options[index].add_on.push({});
		}

		$scope.removeAddon = function(list, index) {
			if(confirm('Are you sure?')) {
				list.splice(index, 1);
			}
		}

		$scope.addNewItem = function() {
			$scope.validateItem().then(function() {
				var item_obj = angular.copy($scope.current_item);
				delete $scope.current_item;
				$scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items.push(item_obj);
				WizardHandler.wizard().goTo('Manage Section');
			}, function(err) {
				toastr.error(err, 'ERROR');
			});
		}

		$scope.updateItem = function() {
			$scope.validateItem().then(function() {
				var item_obj = angular.copy($scope.current_item);
				delete $scope.current_item;
				$scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items[$scope.itemIndex] = item_obj;
				WizardHandler.wizard().goTo('Manage Section');
			}, function(err) {
				toastr.error(err, 'ERROR');
			});
		}

		$scope.addAnotherItem = function() {
			var item_obj = angular.copy($scope.current_item);
			$scope.current_item = {
				item_options: []
			};
			$scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items.push(item_obj);
		}

		$scope.cancelItem = function() {
			delete $scope.current_item;
			WizardHandler.wizard().goTo('Manage Section');
		}

		$scope.backToDesc = function() {
			async.each($scope.menu.menu_description, function(description, callback) {
				if(!description.menu_category) {
					callback('Menu category name required');
				} else if (!description.sections || !description.sections.length) {
					callback('All menu categories must have atleast one section');
				} else {
					async.each(description.sections, function(section, callback) {
						if (!section.section_name) {
							callback('All sections must have a section name');
						} else if (!section.items || !section.items.length) {
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
					toastr.error(err, 'ERROR')
				} else {
					WizardHandler.wizard().goTo('Menu Basics');
				}
			});
		}

		$scope.backToSection = function() {
			if ($scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items.length === 0) {
				toastr.error('Atleast one item required in every section');
			} else {
				WizardHandler.wizard().goTo('Manage Desc');	
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

		$scope.validateItem = function() {
			var deferred = $q.defer();
			if (!$scope.current_item.item_name) {
				deferred.reject('Item name is mandatory');
			} else if (!$scope.current_item.item_tags || !$scope.current_item.item_tags.length) {
				deferred.reject('Atleast one item tag is required');
			} else if (!$scope.current_item.item_cost && $scope.current_item.item_options.length === 0) {
				deferred.reject('Either item cost or atleast one item option mandatory');
			} else {
				async.each($scope.current_item.item_options, function(item_option, callback) {
					if(!item_option.option) {
						callback('All item options must have a valid name');
					} else if (!item_option.option_cost) {
						callback('All item options must have a valid cost');
					} else if (!item_option.addon || !item_option.addon.length) {
						callback();
					} else {
						async.each(item_option.addon, function(add_on, callback) {
							if (!add_on.add_on_item) {
								callback('All addons must have valid name');
							} else if (!add_on.add_on_item_cost) {
								callback('All addons must have valid cost');
							} else {
								callback();
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
		$scope.current_item.option_set.push({sub_options: [], addons: []});
	}

	$scope.removeOptionSet = function(index) {
		if (!$scope.current_item || !$scope.current_item.option_sets || !$scope.current_item.option_sets[index]) {
			toastr.error("Option set out of bounds");
		} else {
			$scope.current_item.option_sets.splice(index, 1);
		}
	}

	$scope.addSubVariant = function(option) {
		option.sub_options.push({sub_option_set: []})
	}

	$scope.addSubOptionPair = function(sub_option) {
		sub_option.sub_option_set.push({});
	}

	$scope.removeSubOption = function(option, index) {
		option.sub_options.splice(index, 1);
	}

	$scope.removeSubOptionObj = function(sub_option, $index) {
		sub_option.sub_option_set.splice($index, 1);
	}

	$scope.addOption = function(option_set) {
		option_set.options.push({});
	}

	$scope.removeOption = function(index) {
		$scope.current_item.option_set.splice(index, 1);
	}

	$scope.addAddon = function(option_set) {
		option_set.addons.push({});
	}

	$scope.addItemOption = function() {
		$scope.current_item.item_options.push({add_on: []});
	}

	$scope.addAddonSet = function(option) {
		option.addons.push({addon_set: []});
	}

	$scope.removeAddon = function(option, index) {
		option.addons.splice(index, 1);
	}

	$scope.addAddonObj = function(addon) {
		addon.addon_set.push({});
	}

	$scope.removeAddonObj = function(addon, index) {
		addon.addon_set.splice(index, 1);
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
						return _.clone(sub_category.items[index] || {option_sets: []});
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

	$scope.removeItemOption = function(index) {
		console.log(index, $scope.current_item, $scope.current_item.item_options, $scope.current_item.item_options[index])
		if(!$scope.current_item || !$scope.current_item.item_options || !$scope.current_item.item_options[index]) {
			toastr.error('Item option out of bounds');
		} else {
			$scope.current_item.item_options.splice(index, 1);
		}
	}

	// $scope.addAddon = function(index) {
	// 	$scope.validateItem().then(function() {
	// 		$scope.current_item.item_options[index].add_on.push({});
	// 	}, function(err) {
	// 		toastr.error(err);
	// 	});
	// }

	$scope.removeAddon = function(option_set, index) {
		if(!option_set || !option_set.addons || !option_set.addons[index]) {
			toastr.error('Addon out of bounds');
		} else {
			option_set.addons.splice(index, 1);
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
		} else if (!$scope.current_item.item_cost) {
			deferred.reject("Base cost is mandatory");
		} else if (!$scope.current_item.option_set_title) {
			deferred.reject("Variant header required");
		} else if ($scope.current_item.option_set.length === 0) {
			deferred.reject('Atleast one option mandatory');
		} else {
			async.each($scope.current_item.option_set, function(option_set, callback) {
				if (!option_set.option_set_value) {
					callback("All item option sets must have a valid value")
				} else if (!option_set.option_set_cost) {
					callback("All item option sets must have a valid cost");
				} else {
					async.each(option_set.sub_options, function(sub_option, callback) {
						if(!sub_option.sub_option_title) {
							callback("All sub variant sets must have valid headers");
						} else if ((!sub_option.sub_option_set || sub_option.sub_option_set.length === 0)) {
							callback("Atleast one key-value pair required for all sub variant sets");
						} else {
							async.each(sub_option.sub_option_set, function(sub_option_obj, callback) {
								console.log(sub_option_obj);
								if (!sub_option_obj.sub_option_value) {
									callback("All sub variant sets must have valid value");
								} else if (!sub_option_obj.sub_option_cost) {
									callback("All sub variant sets must have valid cost");
								} else {
									async.each(option_set.addons, function(addon, callback) {
										if (!addon.addon_title) {
											callback("All addon sets must have valid title");
										} else if (!addon.addon_set || addon.addon_set.length === 0) {
											callback('All addons must have atleast one key-value pair');
										} else {
											async.each(addon.addon_set, function(addon_obj, callback) {
												if (!addon_obj.addon_value) {
													callback("All addons must have valid value");
												} else if (!addon_obj.addon_cost) {
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