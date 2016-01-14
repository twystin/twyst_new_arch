angular.module('consoleApp').controller('MenuViewController', ['$scope', 'consoleRESTSvc', 'SweetAlert', '$state', '$q', '$modal', '$stateParams',
    function($scope, consoleRESTSvc, SweetAlert, $state, $q, $modal, $stateParams) {
        consoleRESTSvc.getOutlets().then(function(res) {
            $scope.outlets = res.data.outlets;
        }, function(err) {
            $scope.outlets = [];
            console.log(err);
        });

        $scope.menu = {
            status: 'active',
            menu_categories: []
        };

        consoleRESTSvc.getMenu($stateParams.menu_id).then(function(res) {
            $scope.menu = _.extend($scope.menu, res.data);
        }, function(err) {
            if (err.message) {
                SweetAlert.swal('Service Error', err.message, 'error');
            } else {
                SweetAlert.swal('Service Error', 'Something went wrong.', 'error');
            }
        });

        $scope.toggle = function(scope) {
            scope.toggle();
        };
    }
]);
