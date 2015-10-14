angular.module('consoleApp')
	.controller('QRCreateController', ['$scope', 'toastr', 'consoleRESTSvc',
		function($scope, toastr, consoleRESTSvc) {
			consoleRESTSvc.getAllOutlets().then(function(data) {
				$scope.outlets = data.data;
				console.log(data.data);
			}, function(err) {
				console.log(err);
				if(err.message) {
					toastr.error(err.message, "Error");
				} else {
					toastr.error("Something went wrong while trying to load the outlets", "Error");
				}
			});

			$scope.minDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
			$scope.maxDate = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000));

			$scope.qr_req = {
				num: 1,
				type: 'single',
				max_use_limit: 1,
			};

			$scope.updateOutletId = function(item) {
				$scope.qr_req.outlet = item._id;
			}

			$scope.updateQrLimit = function() {
				if($scope.qr_req.type==='single') {
					$scope.qr_req.max_use_limit = 1;
				} else {
					$scope.qr_req.max_use_limit = 5;
				}
			}

			$scope.updateValidityEnd = function() {
				if(!$scope.qr_req.validity || !$scope.qr_req.validity.start) {
					return;
				}
				$scope.qr_req.validity.end = new Date($scope.qr_req.validity.start.getTime() + (30*24*60*60*1000));
			}

			$scope.generateQR = function() {
				if (!$scope.qr_req.outlet) {
					toastr.error("Please choose an outlet first", "Outlet missing");
				} else if (!$scope.qr_req.num) {
					toastr.error("Please provide the number of QRs required", "QR count missing");
				} else if (!$scope.qr_req.type) {
					toastr.error("Please specify a QR type ", "QR type missing");
				} else if (!$scope.qr_req.max_use_limit) {
					toastr.error("Please specify a QR usage limit");
				} else if (!$scope.qr_req.max_use_limit) {
					toastr.error("Please specify a max usage limit", "Usage limit missing");
				} else if (!$scope.qr_req.validity || !$scope.qr_req.validity.start || !$scope.qr_req.validity.end) {
					toastr.error("Both validity start and end are mandatory", "Validity info missing");
				} else  if(new Date($scope.qr_req.validity.start.getTime() + (7*24*60*60*1000))>$scope.qr_req.validity.end) {
						toastr.error("QR must be valid for alteast one week", "Validity duration invalid.");
				} else {
					consoleRESTSvc.createQr($scope.qr_req).then(function(data) {
						console.log(data);
						$scope.generated_qrs = data.data
					}, function(err) {
						if(err.message) {
							toastr.error(err.message, "Error");
						} else {
							toastr.error("Something went wrong", "Error");
						}
					});
				}
			}
		}
	]);