angular.module('merchantApp').controller('MenuCreateController', ['$scope', 'merchantRESTSvc', 'toastr', 'WizardHandler', '$timeout', '$state', '$q', '$modal',
	function($scope, merchantRESTSvc, toastr, WizardHandler, $timeout, $state, $q, $modal) {
		$scope.menu = {
			status: 'active',
			menu_description: []
		};

		// $scope.menu = {"status":"draft","menu_description":[{"sections":[{"items":[{"item_options":[{"add_on":[{"add_on_item":"sfvss","add_on_item_cost":"342"}],"option":"fvr","option_cost":546}],"item_name":"wd","item_description":"df","item_tags":["sdf","fre","yt"],"item_cost":345}],"section_name":"asd","section_description":"ads"}],"menu_category":"asd"}],"menu_type":"asd", "outlet": "556568e81ade70eb1974b956"};

		$scope.menu_types = ['Dine-In', 'Takeaway', 'Delivery', 'Weekend', 'Dinner', 'All'];
		$scope.menu_categories = ['Indian', 'Desserts', 'Cakes', 'Chinese', 'Soup'];
		$scope.section_names = ['Veg Starters', 'Non Veg Starters', 'Veg Main Course', 'Non Veg Main Course'];

		$scope.addDesc = function() {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuCategoryTemplate.html',
				controller: 'MenuCategoryController',
				size: 'lg',
				resolve: {
					menu_category: {
						sections: []
					},
					is_new: true,
				}
			});

			modalInstance.result.then(function(category) {
				$scope.menu.menu_description.push(category);
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

		$scope.manageDesc = function(index) {
			if(!$scope.menu.menu_description || !$scope.menu.menu_description[index]) {
				toastr.error("Menu category out of bounds");
			} else {
				$scope.descIndex = index;
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'menuCategoryTemplate.html',
					controller: 'MenuCategoryController',
					size: 'lg',
					resolve: {
						menu_category: _.clone($scope.menu.menu_description[index] || {}),
						is_new: false,
					}
				});

				modalInstance.result.then(function(category) {
					$scope.menu.menu_description[$scope.descIndex] = category;
				}, function() {
					console.log('Modal dismissed at: ', new Date());
				});
			}
		}

		$scope.removeDesc = function(index) {
			if(confirm('Are you sure?')) {
				$scope.menu.menu_description.splice(index, 1);
			}
		}

		$scope.addSection = function(index) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuSectionTemplate.html',
				controller: 'MenuSectionController',
				size: 'lg',
				resolve: {
					section: {
						items: []
					},
					is_new: true
				}
			});

			modalInstance.result.then(function(section) {
				$scope.menu.menu_description[index].sections.push(section);
			}, function() {
				console.log('Modal dismissed at: ', new Date());
			})
		}

		$scope.manageSection = function(index) {
			if(!category || !category.sections || !category.sections[index]) {
				toastr.error("Section out of bounds");
			} else {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'menuSectionTemplate.html',
					controller: 'MenuSectionController',
					size: 'lg',
					resolve: {
						section: _.clone(category.sections[index] || {}),
						is_new: false
					}
				});

				modalInstance.result.then(function(section) {
					category.sections[index] = section;
				}, function() {
					console.log('Modal dismissed at: ', new Date());
				});
			}
		}

		$scope.removeSection = function(index) {
			if(confirm('Are you sure?')) {
				$scope.menu.menu_description[$scope.descIndex].sections.splice(index, 1);
			}
		}

		$scope.addItem = function(section) {
			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'menuItemTemplate.html',
				controller: 'MenuItemController',
				size: 'lg',
				resolve: {
					item: {item_options: []},
					is_new: true
				}
			});

			modalInstance.result.then(function(item) {
				section.items.push(item);
			}, function() {
				console.log('Modal dismissed at: ', new Date());
			});
		}

		$scope.editItem = function(index) {
			if(!section || !section.items || !section.items[index]) {
				toastr.error("Item out of bounds");
			} else {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'menuItemTemplate.html',
					controller: 'MenuItemController',
					size: 'lg',
					resolve: {
						item: _.clone(section.items[index] || {item_options: []}),
						is_new: false
					}
				});

				modalInstance.result.then(function(item) {
					section.items[index] = item;
				}, function() {
					console.log('Modal dismissed at: ', new Date());
				});
			}
		}

		$scope.deleteItem = function(index) {
			if(confirm("Are you sure?")) {
				$scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items.splice(index, 1);
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
					async.each(description.sections, function(section) {
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
				async.each($scope.menu.menu_description, function(description, callback) {
					if(!description.menu_category) {
						callback('Menu category name required');
					} else if (!description.sections || !description.sections.length) {
						callback('All menu categories must have atleast one section');
					} else {
						async.each(description.sections, function(section) {
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

		$scope.validateItem = function() {
			var deferred = $q.defer();
			if (!$scope.current_item.item_name) {
				deferred.reject('Item name is mandatory');
			} else if (!$scope.current_item.item_description) {
				deferred.reject('Item required')
			} else if (!$scope.current_item.item_tags) {
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
]);