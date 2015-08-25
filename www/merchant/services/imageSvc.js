angular.module('merchantApp')
	.factory('imageSvc', ['$http', '$q', '$cookies', 'Upload',
		function($http, $q, $cookies, Upload) {
			var imageSvc = {};

			imageSvc.uploadImage = function(image_file, image_meta) {
				var deferred = $q.defer();
				Upload.upload({
					url: '/api/v4/images',
					method: 'PUT',
					file: image_file,
					data: image_meta,
					fields: image_meta
				}).success(function(data) {
					deferred.resolve(data);
				}).error(function(data) {
					deferred.reject(data);
				});
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