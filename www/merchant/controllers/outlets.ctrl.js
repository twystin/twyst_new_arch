merchantApp.controller('OutletsCtrl', ['$scope', '$cookies', '$log', '$state', 'twystRESTSvc', 'toastr', function($scope, $cookies, $log, $state, twystRESTSvc, toastr) {

  $scope.getOutlets = function() {
    $log.log("Get outlets called");
    twystRESTSvc.getOutlets().then(function(data) {
      $log.log("Got outlets");
      $log.log(data);
    }, function(err) {
      $log.log("Could not get outlets");
    });
  }
}]);
