angular.module('consoleApp').controller('RegisterMerchantController', ['$scope', 'consoleRESTSvc', 'SweetAlert',
    function($scope, consoleRESTSvc, SweetAlert) {

        $scope.init = function() {
            $scope.merchant = {
                isPaying: false,
                is_merchant: true
            };
        };

        $scope.init();

        $scope.registerMerchant = function() {
            if (!$scope.merchant) {
                SweetAlert.swal('Validation error', 'Please fill-in the details first', 'error');
            } else if (!$scope.merchant.username) {
                SweetAlert.swal('Validation error', 'Username required', 'error');
            } else if (!$scope.merchant.password) {
                SweetAlert.swal('Validation error', 'Password required', 'error');
            } else if (!$scope.merchant.rePassword) {
                SweetAlert.swal('Validation error', 'Please retype the password', 'error');
            } else if (!_.isEqual($scope.merchant.password, $scope.merchant.rePassword)) {
                SweetAlert.swal('Validation error', 'Passwords do not match', 'error');
            } else if ($scope.merchant.isPaying && !$scope.merchant.email) {
                SweetAlert.swal('Validation error', 'Email ID required', 'error');
            } else {
                var merchant = {
                    username: $scope.merchant.username.toLowerCase(),
                    password: $scope.merchant.password,
                    isPaying: false,
                    role: 3
                };

                if (!$scope.merchant.is_merchant) {
                    merchant.role = 2;
                }

                if ($scope.merchant.isPaying) {
                    merchant.isPaying = true;
                }

                if ($scope.merchant.isPaying || !$scope.merchant.is_merchant) {
                    merchant.email = $scope.merchant.email;
                }

                consoleRESTSvc.registerMerchant(merchant).then(function(res) {
                    if (res.response) {
                        SweetAlert.swal("SUCCESS", res.message, "success");
                        $scope.init();
                    } else {
                        SweetAlert.swal("ERROR", res.message, 'error');
                    }
                }, function(err) {
                    SweetAlert.swal(err.info.message ? err.info.message : 'Failed to register merchant. Please twy again after sometime', 'error');
                });
            }
        };

        $scope.isPayingUpdated = function() {
            if (!$scope.merchant.isPaying) {
                $scope.merchant.email = '';
            }
        };

    }
]);
