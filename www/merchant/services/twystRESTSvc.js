merchantApp.factory('twystRESTSvc', ['$http', '$q', '$cookies', function($http, $q, $cookies) {
  var twystRESTSvc = {};
  twystRESTSvc.login = function(user) {
    var deferred = $q.defer();
    $http.post('/api/v4/accounts/login', user).then(function(data) {
      deferred.resolve(data.data);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  twystRESTSvc.logout = function(token) {
  	var deferred = $q.defer();
    var token = $cookies.get('token');
  	$http.get('/api/v4/accounts/logout?token='+token).then(function(data) {
      deferred.resolve(data.data);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  return twystRESTSvc;
}]);
