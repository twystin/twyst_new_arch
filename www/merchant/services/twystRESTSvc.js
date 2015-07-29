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

  twystRESTSvc.logout = function() {
  	var deferred = $q.defer();
    var token = $cookies.get('token');
  	$http.get('/api/v4/accounts/logout?token='+token).then(function(data) {
      deferred.resolve(data.data);
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  twystRESTSvc.getOutlets = function() {
    var deferred = $q.defer();
    var token = $cookies.get('token');
    $http.get('/api/v4/outlets?token='+token).then(function(data) {
      if (!data.data.response) {
        deferred.reject(data.data);
      } else {
        deferred.resolve(data.data);
      }
    }, function(err) {
      deferred.reject(err);
    });
    return deferred.promise;    
  }

  return twystRESTSvc;
}]);
