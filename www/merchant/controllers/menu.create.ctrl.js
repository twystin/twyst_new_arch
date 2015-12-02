angular.module('merchantApp').controller('MenuCreateController', ['$scope', 'merchantRESTSvc', 'toastr', 'WizardHandler', '$timeout', '$state', '$q', '$modal',
	function($scope, merchantRESTSvc, toastr, WizardHandler, $timeout, $state, $q, $modal) {
		// $scope.menu = {
		// 	status: 'active',
		// 	menu_categories: []
		// };
		$scope.menu = {"status":"active","menu_categories":[{"sub_categories":[{"sub_category_name":"Default","items":[{"option_set":[{"sub_options":[],"addons":[],"option_set_value":"zxc","option_set_cost":123}],"is_vegetarian":false,"option_set_is_addon":false,"item_name":"asd","item_cost":123,"item_description":"aasd","item_tags":["asd"],"option_set_title":"qwe"}]}],"category_name":"Indian"}],"menu_type":"Dine-In","outlet":"556568e81ade70eb1974b956"}
		$scope.current_category = '';

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
							option_set: [],
							is_vegetarian: false,
							option_set_is_addon: false
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

		// $scope.menu = {
		// 	status: 'active',
		// 	menu_categories: []
		// };

		// // $scope.menu = {"status":"draft","menu_categories":[{"sections":[{"items":[{"item_options":[{"add_on":[{"add_on_item":"sfvss","add_on_item_cost":"342"}],"option":"fvr","option_cost":546}],"item_name":"wd","item_description":"df","item_tags":["sdf","fre","yt"],"item_cost":345}],"section_name":"asd","section_description":"ads"}],"menu_category":"asd"}],"menu_type":"asd", "outlet": "556568e81ade70eb1974b956"};

		// $scope.menu_types = ['Dine-In', 'Takeaway', 'Delivery', 'Weekend', 'Dinner', 'All'];
		// $scope.menu_categories = ['Indian', 'Desserts', 'Cakes', 'Chinese', 'Soup'];
		// $scope.section_names = ['Veg Starters', 'Non Veg Starters', 'Veg Main Course', 'Non Veg Main Course'];

		// $scope.addMenuCategory = function() {
		// 	var modalInstance = $modal.open({
		// 		animation: true,
		// 		templateUrl: 'menuCategoryTemplate.html',
		// 		controller: 'MenuCategoryController',
		// 		size: 'lg',
		// 		resolve: {
		// 			menu_category: function() {
		// 				return {
		// 					sub_categories: [{sub_category_name: 'Default', items: []}]
		// 				};
		// 			},
		// 			is_new: function() {
		// 				return true
		// 			}
		// 		}
		// 	});

		// 	modalInstance.result.then(function(category) {
		// 		$scope.menu.menu_categories.push(category);
		// 	}, function() {
		// 		console.log('Modal dismissed at: ', new Date());
		// 	});
		// }

		merchantRESTSvc.getOutlets().then(function(res) {
			$scope.outlets = res.data.outlets;
		}, function(err) {
			$scope.outlets = [];
			console.log(err);
		})

		// $scope.manageDesc = function(index) {
		// 	if(!$scope.menu.menu_categories || !$scope.menu.menu_categories[index]) {
		// 		toastr.error("Menu category out of bounds");
		// 	} else {
		// 		$scope.descIndex = index;
		// 		var modalInstance = $modal.open({
		// 			animation: true,
		// 			templateUrl: 'menuCategoryTemplate.html',
		// 			controller: 'MenuCategoryController',
		// 			size: 'lg',
		// 			resolve: {
		// 				menu_category: function() {
		// 					return _.clone($scope.menu.menu_categories[index] || {});
		// 				},
		// 				is_new: function() {
		// 					return false;
		// 				}
		// 			}
		// 		});

		// 		modalInstance.result.then(function(category) {
		// 			$scope.menu.menu_categories[$scope.descIndex] = category;
		// 		}, function() {
		// 			console.log('Modal dismissed at: ', new Date());
		// 		});
		// 	}
		// }

		// $scope.removeDesc = function(index) {
		// 	if(confirm('Are you sure?')) {
		// 		$scope.menu.menu_categories.splice(index, 1);
		// 	}
		// }

		// $scope.addSubCategory = function(index) {
		// 	var modalInstance = $modal.open({
		// 		animation: true,
		// 		templateUrl: 'subCategoryTemplate.html',
		// 		controller: 'MenuSectionController',
		// 		size: 'lg',
		// 		resolve: {
		// 			sub_category: function() {
		// 				return {
		// 					items: []
		// 				};
		// 			},
		// 			is_new: function() {
		// 				return true
		// 			}
		// 		}
		// 	});

		// 	modalInstance.result.then(function(section) {
		// 		$scope.menu.menu_categories[index].sub_categories.push(section);
		// 	}, function() {
		// 		console.log('Modal dismissed at: ', new Date());
		// 	})
		// }

		// $scope.manageSection = function(index) {
		// 	if(!category || !category.sections || !category.sections[index]) {
		// 		toastr.error("Section out of bounds");
		// 	} else {
		// 		var modalInstance = $modal.open({
		// 			animation: true,
		// 			templateUrl: 'subCategoryTemplate.html',
		// 			controller: 'MenuSectionController',
		// 			size: 'lg',
		// 			resolve: {
		// 				sub_category: function() {
		// 					return _.clone(category.sections[index] || {});
		// 				},
		// 				is_new: function() {
		// 					return false;
		// 				}
		// 			}
		// 		});

		// 		modalInstance.result.then(function(section) {
		// 			category.sections[index] = section;
		// 		}, function() {
		// 			console.log('Modal dismissed at: ', new Date());
		// 		});
		// 	}
		// }

		// $scope.removeSection = function(desc, index) {
		// 	if(confirm('Are you sure?')) {
		// 		if(desc && desc.sections && desc.sections[index]) {
		// 			desc.sections.splice(index, 1);
		// 		} else {
		// 			toastr.error('Section out of bounds');
		// 		}
		// 	}
		// }

		// $scope.addItem = function(section) {
		// 	var modalInstance = $modal.open({
		// 		animation: true,
		// 		templateUrl: 'menuItemTemplate.html',
		// 		controller: 'MenuItemController',
		// 		size: 'lg',
		// 		resolve: {
		// 			item: function() {
		// 				return {option_sets: []};
		// 			},
		// 			is_new: function() {
		// 				return true;
		// 			}
		// 		}
		// 	});

		// 	modalInstance.result.then(function(item) {
		// 		section.items.push(item);
		// 	}, function() {
		// 		console.log('Modal dismissed at: ', new Date());
		// 	});
		// }

		// $scope.editItem = function(index) {
		// 	if(!section || !section.items || !section.items[index]) {
		// 		toastr.error("Item out of bounds");
		// 	} else {
		// 		var modalInstance = $modal.open({
		// 			animation: true,
		// 			templateUrl: 'menuItemTemplate.html',
		// 			controller: 'MenuItemController',
		// 			size: 'lg',
		// 			resolve: {
		// 				item: function() {
		// 					return _.clone(section.items[index] || {option_sets: []})
		// 				},
		// 				is_new: function() {
		// 					return false
		// 				}
		// 			}
		// 		});

		// 		modalInstance.result.then(function(item) {
		// 			section.items[index] = item;
		// 		}, function() {
		// 			console.log('Modal dismissed at: ', new Date());
		// 		});
		// 	}
		// }

		// $scope.deleteItem = function(section, index) {
		// 	if(confirm("Are you sure?")) {
		// 		if(section && section.items && section.items[index]) {
		// 			section.items.splice(index, 1);
		// 		} else {
		// 			toastr.error("Iten out of bounds");
		// 		}
		// 	}
		// }

		// $scope.addItemOption = function(index) {
		// 	$scope.current_item.option_sets.push({add_on: []});
		// }

		// $scope.removeItemOption = function(index) {
		// 	if(confirm('Are you sure?')) {
		// 		$scope.current_item.option_sets.splice(index, 1);
		// 	}
		// }

		// $scope.addAddon = function(index) {
		// 	$scope.current_item.option_sets[index].add_on.push({});
		// }

		// $scope.removeAddon = function(list, index) {
		// 	if(confirm('Are you sure?')) {
		// 		list.splice(index, 1);
		// 	}
		// }

		// $scope.addNewItem = function() {
		// 	$scope.validateItem().then(function() {
		// 		var item_obj = angular.copy($scope.current_item);
		// 		delete $scope.current_item;
		// 		$scope.menu.menu_categories[$scope.descIndex].sections[$scope.sectionIndex].items.push(item_obj);
		// 		WizardHandler.wizard().goTo('Manage Section');
		// 	}, function(err) {
		// 		toastr.error(err, 'ERROR');
		// 	});
		// }

		// $scope.updateItem = function() {
		// 	$scope.validateItem().then(function() {
		// 		var item_obj = angular.copy($scope.current_item);
		// 		delete $scope.current_item;
		// 		$scope.menu.menu_categories[$scope.descIndex].sections[$scope.sectionIndex].items[$scope.itemIndex] = item_obj;
		// 		WizardHandler.wizard().goTo('Manage Section');
		// 	}, function(err) {
		// 		toastr.error(err, 'ERROR');
		// 	});
		// }

		// $scope.addAnotherItem = function() {
		// 	var item_obj = angular.copy($scope.current_item);
		// 	$scope.current_item = {
		// 		option_sets: []
		// 	};
		// 	$scope.menu.menu_categories[$scope.descIndex].sections[$scope.sectionIndex].items.push(item_obj);
		// }

		// $scope.cancelItem = function() {
		// 	delete $scope.current_item;
		// 	WizardHandler.wizard().goTo('Manage Section');
		// }

		// $scope.backToDesc = function() {
		// 	async.each($scope.menu.menu_categories, function(categorycategory, callback) {
		// 		if(!categorycategory.menu_category) {
		// 			callback('Menu category name required');
		// 		} else if (!categorycategory.sections || !categorycategory.sections.length) {
		// 			callback('All menu categories must have atleast one section');
		// 		} else {
		// 			async.each(categorycategory.sections, function(section) {
		// 				if (!section.section_name) {
		// 					callback('All sections must have a section name');
		// 				} else if (!section.items || !section.items.length) {
		// 					callback('All sections must have atleast one item');
		// 				} else {
		// 					callback();
		// 				}
		// 			}, function(err) {
		// 				callback(err);
		// 			});
		// 		}
		// 	}, function(err) {
		// 		if(err) {
		// 			toastr.error(err, 'ERROR')
		// 		} else {
		// 			WizardHandler.wizard().goTo('Menu Basics');
		// 		}
		// 	});
			
		// }

		// $scope.backToSection = function() {
		// 	if ($scope.menu.menu_categories[$scope.descIndex].sections[$scope.sectionIndex].items.length === 0) {
		// 		toastr.error('Atleast one item required in every section');
		// 	} else {
		// 		WizardHandler.wizard().goTo('Manage Desc');	
		// 	}
		// }

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

		// $scope.validateItem = function() {
		// 	var deferred = $q.defer();
		// 	if (!$scope.current_item.item_name) {
		// 		deferred.reject('Item name is mandatory');
		// 	} else if (!$scope.current_item.item_description) {
		// 		deferred.reject('Item required')
		// 	} else if (!$scope.current_item.item_tags) {
		// 		deferred.reject('Atleast one item tag is required');
		// 	} else if (!$scope.current_item.item_cost && $scope.current_item.option_sets.length === 0) {
		// 		deferred.reject('Either item cost or atleast one item option mandatory');
		// 	} else {
		// 		async.each($scope.current_item.option_sets, function(item_option, callback) {
		// 			if(!item_option.option) {
		// 				callback('All item options must have a valid name');
		// 			} else if (!item_option.option_cost) {
		// 				callback('All item options must have a valid cost');
		// 			} else if (!item_option.addon || !item_option.addon.length) {
		// 				callback();
		// 			} else {
		// 				async.each(item_option.addon, function(add_on, callback) {
		// 					if (!add_on.add_on_item) {
		// 						callback('All addons must have valid name');
		// 					} else if (!add_on.add_on_item_cost) {
		// 						callback('All addons must have valid cost');
		// 					} else {
		// 						callback();
		// 					}
		// 				}, function(err) {
		// 					callback(err);
		// 				});
		// 			}
		// 		}, function(err) {
		// 			if(err) {
		// 				deferred.reject(err);
		// 			} else {
		// 				deferred.resolve();
		// 			}
		// 		});
		// 	}
		// 	return deferred.promise;
		// }

	}
]);