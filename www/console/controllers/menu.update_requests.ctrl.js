angular.module('consoleApp').controller('MenuUpdateRequestManageController', ['$scope', 'consoleRESTSvc', '$filter', '$modal', 'SweetAlert',
    function($scope, consoleRESTSvc, $filter, $modal, SweetAlert) {

        $scope.searchKeywords = '';

        $scope.requests = [];

        $scope.filtered_requests = [];

        $scope.row = '';

        $scope.numPerPageOpt = [5, 10, 20, 40];

        $scope.numPerPage = $scope.numPerPageOpt[1];

        $scope.currentPage = 1;

        $scope.current_page_requests = [];

        consoleRESTSvc.getAllEvents('menu_update').then(function(res) {
            console.log(res);
            $scope.requests = res.data;
            $scope.search();
            $scope.select($scope.currentPage);
        }, function(err) {
            console.log(err);
        });

        $scope.select = function(page) {
            var end, start;
            start = (page - 1) * $scope.numPerPage;
            end = start + $scope.numPerPage;
            return $scope.current_page_requests = $scope.filtered_requests.slice(start, end);
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
            $scope.filtered_requests = $filter('filter')($scope.requests, $scope.searchKeywords);
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
            $scope.filtered_requests = $filter('orderBy')($scope.requests, rowName);
            if ($scope.view_status) {
                $scope.sort($scope.view_status);
            }
            return $scope.onOrderChange();
        };

        $scope.sort = function(sort_by) {
            if ($scope.row) {
                $scope.filtered_requests = $filter('orderBy')($scope.requests, $scope.row);
            } else {
                $scope.filtered_requests = $scope.requests;
            }
            $scope.filtered_requests = _.filter($scope.filtered_requests, function(request) {
                return request.event_meta.status.indexOf(sort_by) !== -1;
            });
            $scope.onFilterChange();
        };

        $scope.updateStatus = function(request) {
            consoleRESTSvc.updateEvent(request).then(function(res) {
                SweetAlert.swal('Status Updated', ' ', 'success');
            }, function(err) {
                console.log(err);
                SweetAlert.swal('Internal error', 'Sonething went wrong. Please try after some time.', 'error');
            });
        };

    }
]);
