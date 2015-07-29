merchantApp.controller('OutletsCtrl', ['$scope', '$cookies', '$log', '$state', 'twystRESTSvc', 'toastr', function($scope, $cookies, $log, $state, twystRESTSvc, toastr) {

  $scope.get_outlets = function() {
    $log.log("Get outlets called");
    twystRESTSvc.getOutlets().then(function(data) {
      $log.log("Got outlets");
      $scope.outlets = data.data.outlets;
      $scope.chunkedOutlets = chunk($scope.outlets, 3);
    }, function(err) {
      $log.log("Could not get outlets - " + err.message);
      $scope.outlets = [];
    });
  };

  $scope.new_outlet = function() {
    $state.go('hub.create_outlet');
  }

  $scope.view_outlet = function(o, p) {
    var index = p * 3 + o; // unchunk
    $state.go('hub.view_outlet_detail', {outletId:$scope.outlets[index]._id});
  }

  function chunk(arr, size) {
    var newArr = [];
    for (var i = 0; i < arr.length; i += size) {
      newArr.push(arr.slice(i, i + size));
    }
    return newArr;
  }

}]);
