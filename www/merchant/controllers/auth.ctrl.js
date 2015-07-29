merchantApp.controller('AuthCtrl', ['$scope', '$cookies', '$log', '$state', 'twystRESTSvc', function($scope, $cookies, $log, $state, twystRESTSvc) {
  $scope.login = function() {
    $log.log("Login called");
    twystRESTSvc.login($scope.user).then(function(data) {
    	$cookies.put('token', data.data);
    	$state.go('hub');
    }, function(err) {
    	console.log(err);
    });
  };

  $scope.logout = function() {
  	$log.log("Logout called");
  	twystRESTSvc.logout().then(function(data) {
  		$cookies.remove('token');
      $state.go('home');
  	}, function(err) {
  		console.log(err);
  	});
  }

}]);
