angular.module('merchantApp')
	.factory('merchantRESTSvc', ['$http', '$q', '$cookies',
		function($http, Q, $cookies) {
			var merchantRESTSvc = {};

			merchantRESTSvc.login = function(user) {
				var deferred = Q.defer();
				$http.post('/api/v4/accounts/login', user)
					.then(function(res) {
						deferred.resolve(res);
					}, function(err) {
						deferred.reject(err)
					});
				return deferred.promise;
			}

			merchantRESTSvc.logout = function() {
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

			merchantRESTSvc.getOutlets = function() {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets?token='+token)
					.then(function(data) {
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

			merchantRESTSvc.removeOutlet = function(outlet_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.delete('/api/v4/outlets/' + outlet_id + '?token=' + token)
					.then(function(data) {
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

			merchantRESTSvc.getOutlet = function(outlet_id) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/outlets/' + outlet_id + '?token=' + token)
					.then(function(data) {
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

			merchantRESTSvc.createOffer = function(offer) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.post('/api/v4/offers?token=' + token, offer)
					.then(function(data) {
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

			merchantRESTSvc.getOffer = function(offer_group) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.get('/api/v4/offers/' + offer_group + "?token=" + token)
					.then(function(data) {
						if (data.data.response) {
							deferred.resolve(data.data);
						} else {
							deferred.reject(data.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			merchantRESTSvc.removeOffer = function(offer_group) {
				var deferred = Q.defer();
				var token = $cookies.get('token');
				$http.delete('/api/v4/offers/' + offer_group + '?token=' + token)
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

			return merchantRESTSvc;
		}
	])