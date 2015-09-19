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

			consoleRESTSvc.getBills = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events?event_type=upload_bill&token=' + token)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			consoleRESTSvc.getBill = function(bill_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/events/retrieve/' + bill_id + '?token=' + token)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			consoleRESTSvc.updateBill = function(bill) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.put('/api/v4/events/' + bill._id + '?token=' + token, bill)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			return consoleRESTSvc;
		}
	])