angular.module('consoleApp')
    .controller('LoginController', ['$scope', '$cookies', '$log', '$state', '$rootScope', 'consoleRESTSvc',
        function($scope, $cookies, $log, $state, $rootScope, consoleRESTSvc) {
            if ($rootScope.token) {
                $state.go('console.default', {}, {
                    reload: true
                });
            }

            $scope.logIn = function() {
                consoleRESTSvc.login($scope.user)
                    .then(function(res) {
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
                            $state.go('console.default', {}, {
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
