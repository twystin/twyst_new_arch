angular.module('merchantApp')
	.factory('imageSvc', ['$http', '$q', '$cookies', 'Upload',
		function($http, $q, $cookies, Upload) {
			var imageSvc = {};

			imageSvc.uploadImage = function(request_object) {
				var deferred = $q.defer();
				$http.post('/api/v4/images', request_object)
					.then(function(data) {
						if(data.data.response) {
							deferred.resolve(data.data.data);
						} else {
							deferred.reject(data.data.data);
						}
					}, function(err) {
						deferred.reject(err);
					})
				return deferred.promise;
			};

			imageSvc.deleteImage = function(imageObj) {
				var deferred = $q.defer();
				$upload.upload({
					url: '/api/v4/images',
					method: 'DELETE',
					params: imageObj
				}).success(function(data) {
					deferred.resolve(data);
				}).error(function(data) {
					deferred.reject(data);
				});
				return deferred.promise;
			};

			return imageSvc;

		}
	]);