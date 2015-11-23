angular.module('merchantApp').controller('MenuEditController', ['$scope', 'merchantRESTSvc', 'toastr', 'WizardHandler', '$stateParams', '$state', '$timeout',
	function($scope, merchantRESTSvc, toastr, WizardHandler, $stateParams, $state, $timeout) {
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

		$scope.addDesc = function() {
			$scope.menu.menu_description.push({sections: []});
		}

		merchantRESTSvc.getOutlets().then(function(res) {
			$scope.outlets = res.data.outlets;
		}, function(err) {
			$scope.outlets = [];
			console.log(err);
		})

		$scope.manageDesc = function(index) {
			$scope.descIndex = index;
			WizardHandler.wizard().goTo('Manage Desc');
		}

		$scope.removeDesc = function(index) {
			if(confirm('Are you sure?')) {
				$scope.menu.menu_description.splice(index, 1);
			}
		}

		$scope.addSection = function() {
			if (!$scope.descIndex && $scope.descIndex !== 0) {
				toastr.error("Description Index required", "ERROR");
			} else {
				$scope.menu.menu_description[$scope.descIndex].sections.push({items: []});
			}
		}

		$scope.manageSection = function(index) {
			$scope.sectionIndex = index;
			WizardHandler.wizard().goTo('Manage Section');
		}

		$scope.removeSection = function(index) {
			if(confirm('Are you sure?')) {
				$scope.menu.menu_description[$scope.descIndex].sections.splice(index, 1);
			}
		}

		$scope.addItem = function() {
			$scope.new_item = true;
			$scope.current_item = {
				item_options: []
			}
			WizardHandler.wizard().goTo("Manage Item");
		}

		$scope.editItem = function(index) {
			console.log(index, $scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items[index]);
			$scope.new_item = false;
			$scope.itemIndex = index;
			$scope.current_item = _.clone($scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items[index]);
			WizardHandler.wizard().goTo("Manage Item");
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
			var item_obj = angular.copy($scope.current_item);
			delete $scope.current_item;
			$scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items.push(item_obj);
			WizardHandler.wizard().goTo('Manage Section');
		}

		$scope.updateItem = function() {
			var item_obj = angular.copy($scope.current_item);
			delete $scope.current_item;
			$scope.menu.menu_description[$scope.descIndex].sections[$scope.sectionIndex].items[$scope.itemIndex] = item_obj;
			WizardHandler.wizard().goTo('Manage Section');
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
			WizardHandler.wizard().goTo('Menu Basics');
		}

		$scope.backToSection = function() {
			WizardHandler.wizard().goTo('Manage Desc');
		}

		$scope.reviewMenu = function() {
			WizardHandler.wizard().goTo('Review');
		}

		$scope.updateMenu = function() {
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
		}

	}
])