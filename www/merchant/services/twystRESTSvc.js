'use strict';
twystMerchant.factory('twystRESTSvc', function ($rootScope, $http, $log, $q, $cookies) {
    var twystRESTSvc = {};

    twystRESTSvc.login = function(user) {
        var deferred = $q.defer();
        $http.post('http://localhost:3000/api/v4/accounts/login', user).then(function(data) {
            deferred.resolve(data.data);
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    twystRESTSvc.profile = function() {
        var deferred = $q.defer();
        var token = $cookies.get('token');

        if (token) {
            $http.get('/api/v4/profile?token=' + token).then(function(data) {
                deferred.resolve(data.data);
            }, function(err) {
                deferred.reject(err);
            })
        } else {
            deferred.reject('No auth token provided');
        }
        return deferred.promise;
    };

    return twystRESTSvc;
});