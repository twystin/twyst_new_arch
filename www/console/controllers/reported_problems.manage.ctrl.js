angular.module('consoleApp').controller('ReportedProblemManageController', ['$scope', 'consoleRESTSvc', '$filter',
    function($scope, consoleRESTSvc, $filter) {
        $scope.searchKeywords = '';

        $scope.reported_problems = [];

        $scope.filtered_reported_problems = [];

        $scope.row = '';

        $scope.numPerPageOpt = [5, 10, 20, 40];

        $scope.numPerPage = $scope.numPerPageOpt[1];

        $scope.currentPage = 1;

        $scope.current_page_reported_problems = [];

        consoleRESTSvc.getAllEvents('report_problem').then(function(res) {
            console.log(res);
            $scope.reported_problems = res.data;
            $scope.search();
            $scope.select($scope.currentPage);
        }, function(err) {
            console.log(err);
        });

        $scope.select = function(page) {
            var end, start;
            start = (page - 1) * $scope.currentPage;
            end = start + $scope.numPerPage;
            return $scope.current_page_reported_problems = $scope.filtered_reported_problems.slice(start, end);
        };

        $scope.onFilterChange = function() {
            $scope.select(1);
            $scope.currentPage = 1;
            return $scope.row = '';
        };

        $scope.onNumPerPageChange = function() {
            $scope.select(1);
            $scope.currentPage = 1;
        };

        $scope.onOrderChange = function() {
            $scope.select(1);
            return $scope.currentPage = 1;
        };

        $scope.search = function() {
            $scope.filtered_reported_problems = $filter('filter')($scope.reported_problems, $scope.searchKeywords);
            return $scope.onFilterChange();
        };

        $scope.order = function(rowName) {
            if ($scope.row === rowName) {
                return;
            }

            $scope.row = rowName;
            $scope.filtered_reported_problems = $filter('orderBy')($scope.reported_problems, rowName);
            return $scope.onOrderChange();
        };
    }
])
