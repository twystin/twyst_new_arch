angular.module('merchantApp')
	.controller('PanelVoucherController', function($scope, $modalInstance, vouchers, outlet, SweetAlert, merchantRESTSvc) {

		$scope.today = new Date();
		$scope.THREE_HOURS = new Date(Date.now() - (3 * 60 * 60 * 1000));

		$scope.vouchers = vouchers;
		_.each($scope.vouchers, function(voucher) {
			if (voucher.lapse_date)
                voucher.lapse_date = new Date(voucher.lapse_date);

            if (voucher.expiry_date)
                voucher.expiry_date = new Date(voucher.expiry_date);

            if (voucher.issued_at)
                voucher.issued_at = new Date(voucher.issued_at);
		});

		$scope.redeemUserCoupon = function(code) {
			merchantRESTSvc.redeemUserCoupon(outlet, code)
				.then(function(data) {
					SweetAlert.swal({
						title: 'Coupon redeemed',
						type: 'success',
						text: data.message
					}, function() {
						$modalInstance.close();
					})
				}, function(err) {
					SweetAlert.swal({
						title: 'ERROR', 
						text: err.message?err.message: 'Something went wrong',
						type: 'error'
					}, function() {
						$modalInstance.dismiss('cancel');
					});
				});
		}

	});