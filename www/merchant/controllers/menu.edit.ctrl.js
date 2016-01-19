angular.module('merchantApp')
    .controller('MenuEditController', ['$scope', 'merchantRESTSvc', 'SweetAlert', '$state', '$q', '$modal', '$stateParams',
        function($scope, merchantRESTSvc, SweetAlert, $state, $q, $modal, $stateParams) {

            $scope.menu_types = ['Dine-In', 'Takeaway', 'Delivery', 'Weekend', 'Dinner', 'All'];
            merchantRESTSvc.getOutlets().then(function(res) {
                $scope.outlets = res.data;
            }, function(err) {
                $scope.outlets = [];
                console.log(err);
            });

            merchantRESTSvc.getMenu($stateParams.menu_id).then(function(res) {
                $scope.menu = _.extend($scope.menu, res.data);
                _id = $scope.menu._id;
            }, function(err) {
                if (err.message) {
                    SweetAlert.swal('Service Error', err.message, 'error');
                } else {
                    SweetAlert.swal('Service Error', 'Something went wrong.', 'error');
                }
            });

            $scope.menu = {
                status: 'active',
                menu_categories: []
            };

            $scope.toggle = function(scope) {
                scope.toggle();
            };

            $scope.cloneCategory = function(index) {
                SweetAlert.swal({
                    title: 'Clone category!',
                    text: 'Are you sure you want to clone this category?',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Clone It!'
                }, function(confirm) {
                    if (confirm) {
                        var cloned_category = _.cloneDeep($scope.menu.menu_categories[index]);
                        delete cloned_category._id;
                        _.each(cloned_category.sub_categories, function(sub_category) {
                            delete sub_category._id;
                            _.each(sub_category.items, function(item) {
                                delete item._id;
                                _.each(item.options, function(option) {
                                    delete option._id;
                                    _.each(option.sub_options, function(sub_option) {
                                        delete sub_option._id;
                                        _.each(sub_option.sub_option_set, function(sub_option_obj) {
                                            delete sub_option_obj._id;
                                        });
                                    });
                                    _.each(option.addons, function(addon) {
                                        delete addon._id;
                                        _.each(addon.addon_set, function(addon_obj) {
                                            delete addon_obj._id;
                                        });
                                    });
                                });
                            });
                        });
                        $scope.menu.menu_categories.push(_.cloneDeep($scope.menu.menu_categories[index]));
                    }
                });
            };

            $scope.editCategory = function(index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '../common/templates/partials/menu.category.tmpl.html',
                    controller: 'MenuCategoryController',
                    size: 'lg',
                    resolve: {
                        category: function() {
                            return _.cloneDeep($scope.menu.menu_categories[index]);
                        },
                        is_new: function() {
                            return true;
                        }
                    }
                });

                modalInstance.result.then(function(category) {
                    $scope.menu.menu_categories[index] = category;
                });
            };

            $scope.removeCategory = function(index) {
                SweetAlert.swal({
                    title: 'Delete category!',
                    text: 'Are you sure you want to delete?',
                    type: 'warning',
                    confirmButtonColor: "#DD6B55",
                    showCancelButton: true,
                    confirmButtonText: 'Delete It!'
                }, function(confirm) {
                    if (confirm) {
                        $scope.menu.menu_categories.splice(index, 1);
                    }
                });
            };

            $scope.cloneSubCategory = function(category, index) {
                SweetAlert.swal({
                    title: 'Clone sub category!',
                    text: 'Are you sure you want to clone this sub category?',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Clone It!'
                }, function(confirm) {
                    if (confirm) {
                        var cloned_subcategory = _.cloneDeep(category.sub_categories[index]);
                        delete cloned_subcategory._id;
                        _.each(cloned_subcategory.items, function(item) {
                            delete item._id;
                            _.each(item.options, function(option) {
                                delete option._id;
                                _.each(option.sub_options, function(sub_option) {
                                    delete sub_option._id;
                                    _.each(sub_option.sub_option_set, function(sub_option_obj) {
                                        delete sub_option_obj._id;
                                    });
                                });
                                _.each(option.addons, function(addon) {
                                    delete addon._id;
                                    _.each(addon.addon_set, function(addon_obj) {
                                        delete addon_obj._id;
                                    });
                                });
                            });
                        });
                        category.sub_categories.push(cloned_subcategory);
                    }
                });
            };

            $scope.editSubCategory = function(category, index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '../common/templates/partials/menu.sub_category.tmpl.html',
                    controller: 'MenuSubCategoryController',
                    size: 'lg',
                    resolve: {
                        sub_category: function() {
                            return _.cloneDeep(category.sub_categories[index]);
                        },
                        is_new: function() {
                            return false
                        }
                    }
                });

                modalInstance.result.then(function(sub_category) {
                    category.sub_categories[index] = sub_category;
                });
            };

            $scope.removeSubCategory = function(category, index) {
                SweetAlert.swal({
                    title: 'Delete sub category!',
                    text: 'Are you sure you want to delete?',
                    type: 'warning',
                    confirmButtonColor: "#DD6B55",
                    showCancelButton: true,
                    confirmButtonText: 'Delete It!'
                }, function(confirm) {
                    if (confirm) {
                        category.sub_categories.splice(index, 1);
                    }
                });
            };

            $scope.cloneItem = function(sub_category, index) {
                SweetAlert.swal({
                    title: 'Clone item!',
                    text: 'Are you sure you want to clone this item?',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Clone It!'
                }, function(confirm) {
                    if (confirm) {
                        var cloned_item = _.cloneDeep(sub_category.items[index]);
                        delete cloned_item._id;
                        _.each(cloned_item.options, function(option) {
                            delete option._id;
                            _.each(option.sub_options, function(sub_option) {
                                delete sub_option._id;
                                _.each(sub_option.sub_option_set, function(sub_option_obj) {
                                    delete sub_option_obj._id;
                                });
                            });
                            _.each(option.addons, function(addon) {
                                delete addon._id;
                                _.each(addon.addon_set, function(addon_obj) {
                                    delete addon_obj._id;
                                });
                            });
                        });
                        sub_category.items.push(cloned_item);
                    }
                });
            };

            $scope.editItem = function(sub_category, index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '../common/templates/partials/menu.item.tmpl.html',
                    controller: 'MenuItemController',
                    size: 'lg',
                    resolve: {
                        item: function() {
                            return _.cloneDeep(sub_category.items[index]);
                        },
                        is_new: function() {
                            return false
                        },
                        limit_access: function() {
                            return true
                        }
                    }
                });

                modalInstance.result.then(function(item) {
                    sub_category.items[index] = item;
                });
            };

            $scope.removeItem = function(sub_category, index) {
                SweetAlert.swal({
                    title: 'Delete item!',
                    text: 'Are you sure you want to delete?',
                    type: 'warning',
                    confirmButtonColor: "#DD6B55",
                    showCancelButton: true,
                    confirmButtonText: 'Delete It!'
                }, function(confirm) {
                    if (confirm) {
                        sub_category.items.splice(index, 1);
                    }
                });
            };

            $scope.cloneOption = function(item, index) {
                SweetAlert.swal({
                    title: 'Clone option!',
                    text: 'Are you sure you want to clone this option?',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Clone It!'
                }, function(confirm) {
                    if (confirm) {
                        var cloned_option = _.cloneDeep(item.options[index]);
                        delete cloned_option._id;
                        _.each(cloned_option.sub_options, function(sub_option) {
                            delete sub_option._id;
                            _.each(sub_option.sub_option_set, function(sub_option_obj) {
                                delete sub_option_obj._id;
                            });
                        });
                        _.each(cloned_option.addons, function(addon) {
                            delete addon._id;
                            _.each(addon.addon_set, function(addon_obj) {
                                delete addon_obj._id;
                            });
                        });
                        item.options.push(cloned_option);
                    }
                });
            };

            $scope.editOption = function(item, index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '../common/templates/partials/menu.option.tmpl.html',
                    controller: 'MenuOptionController',
                    size: 'lg',
                    resolve: {
                        option: function() {
                            return _.cloneDeep(item.options[index]);
                        },
                        is_new: function() {
                            return false
                        },
                        option_title: function() {
                            return item.option_title;
                        },
                        limit_access: function() {
                            return true
                        }
                    }
                });

                modalInstance.result.then(function(option) {
                    item.options[index] = option;
                });
            };

            $scope.removeOption = function(item, index) {
                SweetAlert.swal({
                    title: 'Delete option!',
                    text: 'Are you sure you want to delete?',
                    type: 'warning',
                    confirmButtonColor: "#DD6B55",
                    showCancelButton: true,
                    confirmButtonText: 'Delete It!'
                }, function(confirm) {
                    if (confirm) {
                        item.options.splice(index, 1);
                    }
                });
            };

            $scope.cloneSubOption = function(option, index) {
                SweetAlert.swal({
                    title: 'Clone sub option!',
                    text: 'Are you sure you want to clone these sub options?',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Clone It!'
                }, function(confirm) {
                    if (confirm) {
                        var cloned_suboption = _.cloneDeep(option.sub_options[index]);
                        delete cloned_suboption._id;
                        _.each(cloned_suboption.sub_option_set, function(sub_option_obj) {
                            delete sub_option_obj._id;
                        });
                        option.sub_options.push(cloned_suboption);
                    }
                });
            };

            $scope.editSubOption = function(option, index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '../common/templates/partials/menu.sub_option.tmpl.html',
                    controller: 'MenuSubOptionController',
                    size: 'lg',
                    resolve: {
                        sub_option: function() {
                            return _.cloneDeep(option.sub_options[index]);
                        },
                        is_new: function() {
                            return false
                        },
                        limit_access: function() {
                            return true;
                        }
                    }
                });

                modalInstance.result.then(function(addon) {
                    option.sub_options[index] = addon;
                });
            };

            $scope.removeSubOption = function(option, index) {
                SweetAlert.swal({
                    title: 'Delete sub option set!',
                    text: 'Are you sure you want to delete?',
                    type: 'warning',
                    confirmButtonColor: "#DD6B55",
                    showCancelButton: true,
                    confirmButtonText: 'Delete It!'
                }, function(confirm) {
                    if (confirm) {
                        option.sub_options.splice(index, 1);
                    }
                });
            };

            $scope.cloneAddon = function(option, index) {
                SweetAlert.swal({
                    title: 'Clone addon!',
                    text: 'Are you sure you want to clone these addons?',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Clone It!'
                }, function(confirm) {
                    if (confirm) {
                        var cloned_addon = _.cloneDeep(option.addons[index]);
                        delete cloned_addon._id;
                        _.each(cloned_addon.addon_set, function(addon_obj) {
                            delete addon_obj._id;
                        });
                        option.addons.push(cloned_addon);
                    }
                });
            };

            $scope.editAddon = function(option, index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '../common/templates/partials/menu.addon.tmpl.html',
                    controller: 'MenuAddonController',
                    size: 'lg',
                    resolve: {
                        addon: function() {
                            return _.cloneDeep(option.addons[index]);
                        },
                        is_new: function() {
                            return false
                        },
                        limit_access: function() {
                            return true;
                        }
                    }
                });

                modalInstance.result.then(function(addon) {
                    option.addons[index] = addon;
                });
            };

            $scope.removeAddon = function(option, index) {
                SweetAlert.swal({
                    title: 'Delete addon set!',
                    text: 'Are you sure you want to delete?',
                    type: 'warning',
                    confirmButtonColor: "#DD6B55",
                    showCancelButton: true,
                    confirmButtonText: 'Delete It!'
                }, function(confirm) {
                    if (confirm) {
                        option.addons.splice(index, 1);
                    }
                });
            };

            $scope.updateMenu = function() {
                $scope.reviewMenu().then(function() {
                    merchantRESTSvc.updateMenu($scope.menu).then(function(res) {
                        SweetAlert.swal({
                            title: 'Menu updated successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Continue'
                        }, function() {
                            $state.go('^.menus_manage', {}, {
                                reload: true
                            });
                        });
                    }, function(err) {
                        console.log(err);
                        if (err.message) {
                            SweetAlert.swal('Validation Error', err.message, 'error');
                        } else {
                            SweetAlert.swal('Service Error', 'Unable to update the menu right now', 'error');
                        }
                    });
                }, function(err) {
                    SweetAlert.swal('Validation error', err, 'error');
                });
            };

            $scope.reviewMenu = function() {
                var deferred = $q.defer();
                if (!$scope.menu.menu_type) {
                    deferred.reject('Menu type required');
                } else if (!$scope.menu.outlet) {
                    deferred.reject('Please choose an outlet');
                } else if (!$scope.menu.menu_categories.length) {
                    deferred.reject('Atleast one category must be added');
                } else {
                    async.each($scope.menu.menu_categories, function(category, callback) {
                        if (!category.sub_categories.length) {
                            callback('Atleast one sub category must be added to all categories');
                        } else {
                            async.each(category.sub_categories, function(sub_category, callback) {
                                if (!sub_category.items.length) {
                                    callback('Aleast one item must be present in all sub categories');
                                } else {
                                    callback();
                                }
                            }, function(err) {
                                callback(err);
                            });
                        }
                    }, function(err) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve();
                        }
                    });
                }
                return deferred.promise;
            };
        }
    ])
