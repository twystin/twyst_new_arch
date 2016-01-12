angular.module('merchantApp').controller('LoginController', ['$scope', '$rootScope', 'merchantRESTSvc', '$state', '$cookies', 'SweetAlert', '$timeout',
    function($scope, $rootScope, merchantRESTSvc, $state, $cookies, SweetAlert, $timeout) {

        $scope.user = {
            isMerchant: true
        };

        if ($rootScope.token) {
            $state.go('merchant.default', {}, {
                reload: true
            });
        }

        $scope.logIn = function() {
            merchantRESTSvc.login($scope.user).then(function(res) {
                $cookies.put('token', res.data.data.token);
                $cookies.put('isPaying', res.data.data.is_paying);
                $rootScope.token = res.data.data.token;
                $rootScope.isPaying = res.data.data.is_paying;
                SweetAlert.swal({
                    title: 'Logged In Successfully',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Continue',
                    closeOnConfirm: false
                }, function() {
                    $state.go('merchant.default', {}, {
                        reload: true
                    });
                });
            }, function(err) {
                var message;
                if (err.data) {
                    message = err.data;
                } else {
                    message = 'Invalid credentials';
                }
                SweetAlert.swal({
                    title: 'ERROR',
                    text: message,
                    type: 'error',
                    showCancelButton: false,
                    closeOnConfirm: true
                });
            });
        }

    }
]);
