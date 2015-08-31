angular.module('consoleApp').factory('consoleRESTSvc', ['$http', '$q', '$cookies', 
		function($http, Q, $cookies) {
			var consoleRESTSvc = {};

			consoleRESTSvc.login = function(user) {
				var deferred = Q.defer();
				$http.post('/api/v4/accounts/login', user)
					.then(function(res) {
						deferred.resolve(res);
					}, function(err) {
						deferred.reject(err)
					});
				return deferred.promise;
			}

			consoleRESTSvc.logout = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/accounts/logout?token='+token).then(function(data) {
					if(!data.data.response) {
						deferred.reject(data.data);
					} else {
						deferred.resolve(data.data);
					}
				}, function(err) {
					deferred.reject(err);
				});
				return deferred.promise;
			}

			consoleRESTSvc.registerMerchant = function(merchant) {
				var deferred = Q.defer();
				$http.post('/api/v4/auth/register', merchant)
					.success(function(res) {
						deferred.resolve(res);
					})
					.error(function(err) {
						deferred.reject(err);
					})
				return deferred.promise;
			}

			return consoleRESTSvc;
		}
	])