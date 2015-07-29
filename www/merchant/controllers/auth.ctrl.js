merchantApp.controller('AuthCtrl', ['$scope', '$cookies', '$log', '$state', 'twystRESTSvc', 'toastr', function($scope, $cookies, $log, $state, twystRESTSvc, toastr) {
  $scope.login = function() {
    $log.log("Login called");
    twystRESTSvc.login($scope.user).then(function(data) {
    	$cookies.put('token', data.data);
      toastr.success('Logged in');
    	$state.go('hub.outlets');
    }, function(err) {
      toastr.error('Please check your username & password', 'Error');
    });
  };

  $scope.logout = function() {
  	$log.log("Logout called");
  	twystRESTSvc.logout().then(function(data) {
  		$cookies.remove('token');
      toastr.success('Logged out');
      $state.go('home');
  	}, function(err) {
  		console.log(err);
  	});
  }

}]);
