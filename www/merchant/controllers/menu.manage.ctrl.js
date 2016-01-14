angular.module('merchantApp')
    .controller('MenuManageController', ['$scope', 'merchantRESTSvc', 'SweetAlert', '$modal',
        function($scope, merchantRESTSvc, SweetAlert, $modal) {
            $scope.filters = {
                title: '',
                outlet_name: '',
                locality1: '',
                locality2: ''
            };

            $scope.getMenus = function() {
                merchantRESTSvc.getAllMenus().then(function(res) {
                    $scope.menus = res.data;
                }, function(err) {
                    $scope.menus = [];
                    var message;
                    if (err.message) {
                        message = err.message;
                    } else {
                        message = 'Something went wrong';
                    }
                    SweetAlert.swal({
                        title: 'ERROR',
                        text: message,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Continue",
                        closeOnConfirm: true
                    });
                });
            }

            $scope.menuFilter = function(menu) {
                var titleFilter = new RegExp($scope.filters.title, 'i'),
                    oNameFilter = new RegExp($scope.filters.outlet_name, 'i'),
                    loc1Filter = new RegExp($scope.filters.locality1, 'i'),
                    loc2Filter = new RegExp($scope.filters.locality2, 'i');

                return (titleFilter.test(menu.menu_type) && oNameFilter.test(menu.outlet.name) && loc1Filter.test(menu.outlet.loc1) && loc2Filter.test(menu.outlet.loc2));
            };

            $scope.cloneMenu = function(menu_id, outlet_id) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/partials/menu.clone.tmpl.html',
                    controller: 'MenuCloneController',
                    size: 'lg',
                    resolve: {
                        menu_id: function() {
                            return menu_id;
                        },
                        outlet_id: function() {
                            return outlet_id;
                        }
                    }
                });

                modalInstance.result.then(function() {
                    $scope.getMenus();
                });
            };

            $scope.removeMenu = function(menu_id) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this menu',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: 'Yes, Delete It!',
                    closeOnConfirm: false
                }, function(confirm) {
                    if (confirm) {
                        merchantRESTSvc.deleteMenu(menu_id)
                            .then(function(data) {
                                SweetAlert.swal("SUCCESS", "Menu deleted successfully", "success");
                                $scope.getMenus();
                            }, function(err) {
                                SweetAlert.swal({
                                    title: 'ERROR',
                                    text: 'Unable to delete this menu right now',
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: 'Continue',
                                    closeOnConfirm: true
                                });
                            });
                    }
                });
            };

            $scope.requestMenuUpdate = function(menu) {
                console.log(menu);
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/partials/menu.request_update.tmpl.html',
                    controller: 'MenuRequestUpdateController',
                    size: 'md',
                    resolve: {
                        menu_id: function() {
                            return menu._id;
                        },
                        outlet: function() {
                            return menu.outlet;
                        },
                        menu_type: function() {
                            return menu.menu_type;
                        }
                    }
                });
            };
        }
    ])
