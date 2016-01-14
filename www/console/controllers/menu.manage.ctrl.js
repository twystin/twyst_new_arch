angular.module('consoleApp').controller('MenuManageController', ['$scope', 'consoleRESTSvc', '$filter', '$modal', 'SweetAlert',
    function($scope, consoleRESTSvc, $filter, $modal, SweetAlert) {

        $scope.searchKeywords = '';

        $scope.menus = [];

        $scope.filtered_menus = [];

        $scope.row = '';

        $scope.numPerPageOpt = [5, 10, 20, 40];

        $scope.numPerPage = $scope.numPerPageOpt[1];

        $scope.currentPage = 1;

        $scope.current_page_menus = [];

        consoleRESTSvc.getMenus().then(function(res) {
            console.log(res);
            $scope.menus = res.data;
            $scope.search();
            $scope.select($scope.currentPage);
        }, function(err) {
            console.log(err);
        });

        $scope.select = function(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.current_page_menus = $scope.filtered_menus.slice(start, end);
        };

        $scope.onFilterChange = function() {
            $scope.select(1);
            $scope.currentPage = 1;
            return $scope.row = '';
        };

        $scope.onNumPerPageChange = function() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        $scope.onOrderChange = function() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        $scope.search = function() {
            $scope.filtered_menus = $filter('filter')($scope.menus, $scope.searchKeywords);
            if ($scope.view_status) {
                $scope.sort($scope.view_status);
            }
            return $scope.onFilterChange();
        };

        $scope.order = function(rowName) {
            if ($scope.row == rowName) {
                return;
            }

            $scope.row = rowName;
            $scope.filtered_menus = $filter('orderBy')($scope.menus, rowName);
            if ($scope.view_status) {
                $scope.sort($scope.view_status);
            }
            return $scope.onOrderChange();
        };

        $scope.sort = function(sort_by) {
            console.log('view_status', sort_by);
            if ($scope.row) {
                $scope.filtered_menus = $filter('orderBy')($scope.menus, $scope.row);
            } else {
                $scope.filtered_menus = $scope.menus;
            }
            $scope.filtered_menus = _.filter($scope.filtered_menus, function(menu) {
                return menu.status.indexOf(sort_by) !== -1;
            });
            $scope.onFilterChange();
        };

        $scope.cloneMenu = function(menu_id, outlet_id) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '../common/templates/partials/menu.clone.tmpl.html',
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
                    consoleRESTSvc.deleteMenu(menu_id).then(function(data) {
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

    }
])
