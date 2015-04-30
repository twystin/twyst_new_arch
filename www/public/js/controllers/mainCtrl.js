angular.module('twystWeb')
  .controller('MainCtrl', function ($scope, $location, $http) {
    $scope.submit = function() {
      $http.post('/api/v1/auth/merchant', $scope.user)
      .success(function(s) {
        $location.path('/outlets');
        console.log(s);
      }).error(function(e) {
        console.log(e);
      })
    }
  });
