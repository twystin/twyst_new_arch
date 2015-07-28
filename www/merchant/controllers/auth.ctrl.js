merchantApp.controller('AuthCtrl', ['$scope', '$cookies', '$log', 'twystRESTSvc', function($scope, $cookies, $log, twystRESTSvc) {
  $scope.login = function() {
    $log.log("Login called");
    twystRESTSvc.login($scope.user).then(function(data) {
    	$cookies.put('token', data.data);
    	console.log(data);
    }, function(err) {
    	console.log(err);
    });
  };

  $scope.logout = function() {
  	$log.log("Logout called");
  	twystRESTSvc.logout().then(function(data) {
  		console.log(data);
  	}, function(err) {
  		console.log(err);
  	});
  }

}]);
