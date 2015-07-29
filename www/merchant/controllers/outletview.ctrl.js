merchantApp.controller('OutletViewCtrl', ['$scope', '$cookies', '$log', '$state', 'twystRESTSvc', 'toastr', '$stateParams', function($scope, $cookies, $log, $state, twystRESTSvc, toastr, $stateParams) {
  $scope.getOutletDetail = function() {
  	console.log($stateParams.outletId);
    $log.log("Get outlet detail called");
    twystRESTSvc.getOutletDetail($stateParams.outletId).then(function(data) {
      $log.log("Got outlet");
      $scope.outlet = data.data;
    }, function(err) {
      $log.log("Could not get outlets - " + err.message);
      $scope.outlet = [];
    });
  }
}]);
