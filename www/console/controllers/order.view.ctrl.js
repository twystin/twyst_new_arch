angular.module('consoleApp').controller('OrderViewController', ['$scope', 'consoleRESTSvc', '$stateParams',
    function($scope, consoleRESTSvc, $stateParams) {
        consoleRESTSvc.getOrder($stateParams.order_id)
            .then(function(res) {
                console.log(res);
                $scope.order = res;
            }, function(err) {
                console.log(err);
            });
    }
])
