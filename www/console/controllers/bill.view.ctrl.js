angular.module('consoleApp')
	.controller('BillViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$log', 
		function($scope, toastr, consoleRESTSvc, $log) {
			$scope.bill = {
				_id: 'asd',
				uploaded_on: new Date(),
				user: '123dsa21',
				phone: '9992342321',
				email: 'email@domain.com',
				outlet_name: 'Outlet Name',
				outlet_location: 'Address goes here',
				bill_number: 'BILL0001',
				bill_date: new Date(),
				bill_time: new Date(),
				bill_amount: 2400,
				image: 'https://s3-us-west-2.amazonaws.com/retwyst-merchants/retwyst-outlets/55f01d855198eaee17f4c4a0/background'
			}
		}
	]);