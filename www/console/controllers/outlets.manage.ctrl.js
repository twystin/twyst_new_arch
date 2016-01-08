angular.module('consoleApp').controller('OutletManageController', ['$scope', '$rootScope', 'consoleRESTSvc', '$filter',
    function($scope, $rootScope, consoleRESTSvc, $filter) {

        $scope.searchKeywords = '';

        $scope.outlets = [];

        $scope.filtered_outlets = [];

        $scope.row = '';

        $scope.numPerPageOpt = [5, 10, 20, 40];

        $scope.numPerPage = $scope.numPerPageOpt[1];

        $scope.currentPage = 1;

        $scope.current_page_outlets = [];

        consoleRESTSvc.getOutlets().then(function(res) {
            console.log(res);
            $scope.outlets = res.data;
            $scope.search();
            $scope.select($scope.currentPage);
        }, function(err) {
            console.log(err);
        });

        $scope.select = function(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.current_page_outlets = $scope.filtered_outlets.slice(start, end);
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
            $scope.filtered_outlets = $filter('filter')($scope.outlets, $scope.searchKeywords);
            if ($scope.view_status) {
                $scope.sort($scope.view_status);
            }
            return $scope.onFilterChange();
        };

        $scope.order = function(rowName) {
            if ($scope.row === rowName) {
                return;
            }
            $scope.row = rowName;
            $scope.filtered_outlets = $filter('orderBy')($scope.outlets, rowName);
            if ($scope.view_status) {
                $scope.sort($scope.view_status);
            }
            return $scope.onOrderChange();
        };

        $scope.sort = function(sort_by) {
            console.log('view_status', sort_by);
            if ($scope.row) {
                $scope.filtered_outlets = $filter('orderBy')($scope.outlets, $scope.row);
            } else {
                $scope.filtered_outlets = $scope.outlets;
            }
            $scope.filtered_outlets = _.filter($scope.filtered_outlets, function(outlet) {
                return outlet.outlet_meta.status.indexOf(sort_by) !== -1;
            });
            $scope.onFilterChange();
        };
    }
])
