angular.module('merchantApp')
	.controller('BillUploadViewController', ['$scope', '$state', '$http', '$stateParams', 
		function($scope, $state, $http, $stateParams) {
			$scope.billId = $stateParams.bill_id;

			$scope.bill = {
				created_at: new Date(),
				user: '1231h213kj12jk13',
				phone: '2348769877',
				email: 'abc@domain.com',
				status: 0
			};

			$scope.bill_process = {
				0: {
					question: 'Is the image clear, complete and non-manipulated?',
					positive_feedback: 'Thank you for confirming, please proceed further',
					negetive_feedback: 'Image found to be vague or manuipated. Please reupload the original bill.'
				},
				1: {
					question: 'Is the image of an actual bill?',
					positive_feedback: 'Thank you for confirming.',
					negetive_feedback: 'Image you submitted was found to be invalid. Please upload a proper bill.'
				},
				2: {
					question: 'Is the bill from an recognized outlet?',
					positive_feedback: 'Please submit the outlet details now',
					negetive_feedback: 'The bill provided is not from an outlet we recognize and hence, invalid.'
				}
			};

			$scope.triggerPositiveEvent = function() {
				console.log("triggering positive_feedback... ", $scope.bill_process[$scope.bill.status].positive_feedback);
				$scope.bill.status += 1;
				// $http.put('/bill_uploads/' + billId, {
				// 	'event': 'positive'
				// })
				// .then(function(data) {
				// 	$scope.bill = data.bill;
				// }, function(err) {
				// 	console.log('error', err);
				// });
			};

			$scope.triggerNegetiveEvent = function() {
				console.log("triggering negetive_feedback... ", $scope.bill_process[$scope.bill.status].negetive_feedback);
				// $http.put('/bill_uploads/' + billId, {
				// 	'event': 'negative',
				// 	'message': $scope.bill_process[$scope.bill.status].negetive_feedback
				// })
				// .then(function(data) {
				// 	$scope.bill = data.bill;
				// }, function(err) {
				// 	console.log('error', err);
				// });

			};

			$scope.uploadBillInfo = function() {
				var obj = angular.copy($scope.bill_info);
				obj.event = 'positive';
				console.log('triggering bill info upload... ', $scope.bill_info);
				$scope.bill = _.extend($scope.bill, $scope.bill_info);
				$scope.bill.status += 1;
			};

		}
	])