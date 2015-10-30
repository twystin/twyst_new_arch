angular.module('twystHome', ['ui.bootstrap', 'toastr', 'ngFileUpload']).controller('MainCtrl', function($scope, $http, $modal, toastr) {
	$scope.contactUs = function() {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'contact_form.html',
			controller: 'ContactUsCtrl',
			size: 'lg'
		});

		modalInstance.result.then(function () {
	      toastr.success("Thank you for reaching out. We'll get back shortly");
	    }, function () {
	      console.info('Modal dismissed at: ' + new Date());
	    });
	};


	$scope.applyToTwyst = function() {
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'apply.html',
			controller: 'ApplyCtrl',
			size: 'lg'
		});

		modalInstance.result.then(function() {
			toastr.success('Your application has been submitted.');
		});
	}
}).controller('ContactUsCtrl', function($scope, $modalInstance, $http, toastr, $timeout) {
	
	$scope.submitComments = function() {
		$http.post('/api/v4/contact_us', $scope.contact).then(function(res) {
			if(res.data.response) {
				$modalInstance.close();
			} else {
				$scope.errorMessage = res.data.message;
				$timeout(function() {
					$scope.errorMessage = '';
				}, 1000);
			}
		}, function(error) {
			$scope.errorMessage = error.data.message;
			$timeout(function() {
				$scope.errorMessage = '';
			}, 1000);
		})
	}
}).controller('ApplyCtrl', function($scope, $modalInstance, $http, toastr, $timeout) {

	$scope.submitApplication = function() {
		if(!$scope.application || !$scope.application.resume) {
			toastr.error("Please provide your resume");
		} else {
			var reader = new FileReader();
			reader.onload = function(loadEvent) {
				$http.post('/api/v4/apply', {
					resume: loadEvent.target.result,
					format: $scope.application.resume.type
				}).then(function(success) {
					
					$modalInstance.close();
				}, function(error) {
					
					$scope.errorMessage = error.data.message;
					$timeout(function() {
						$scope.errorMessage = '';
					}, 1000);
				});

			}
			reader.readAsDataURL($scope.application.resume);
		}
	}

})