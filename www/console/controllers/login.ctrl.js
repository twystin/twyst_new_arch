angular.module('consoleApp')
    .controller('LoginController', ['$scope', '$cookies', '$log', '$state', '$rootScope', 'consoleRESTSvc', 'SweetAlert',
        function($scope, $cookies, $log, $state, $rootScope, consoleRESTSvc, SweetAlert) {

            $scope.user = {
                isAdmin: true
            };

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
                        $cookies.put('role', res.data.data.role);
                        $rootScope.token = res.data.data.token;
                        $rootScope.isPaying = res.data.data.is_paying;
                        $rootScope.role = res.data.data.role;
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
                        SweetAlert.swal({
                            title: 'ERROR',
                            text: err.data ? err.data : 'Invalid credentials',
                            type: 'error',
                            showCancelButton: false,
                            closeOnConfirm: true
                        });
                    });
            }
        }
    ]);
