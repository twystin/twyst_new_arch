angular.module('merchantApp')
	.factory('imageSvc', ['$http', '$q',
		function($http, $q) {
			var imageSvc = {};

			imageSvc.uploadImage = function(request_object) {
				var deferred = $q.defer();
				$http.post('/api/v4/images', request_object)
					.then(function(res) {
						if (res.data.response) {
							deferred.resolve(res.data);
						} else {
							deferred.reject(res.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			imageSvc.cloneImage = function(request_object) {
				var deferred = $q.defer();
				$http.post('/api/v4/images/clone', request_object)
					.then(function(res) {
						if (res.data.response) {
							deferred.resolve(res.data);
						} else {
							deferred.reject(res.data);
						}
					}, function(err) {
						deferred.reject(err);
					});
				return deferred.promise;
			}

			return imageSvc;
		}
	])