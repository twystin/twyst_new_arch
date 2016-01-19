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
                        console.log(res);
                        $cookies.put('token', res.data.data.token);
                        $cookies.put('isPaying', res.data.data.is_paying);
                        $cookies.put('role', res.data.data.role);
                        $rootScope.token = res.data.data.token;
                        $rootScope.isPaying = res.data.data.is_paying;
                        $rootScope.role = res.data.data.role;
                        $rootScope.paths = [];
                        if ($rootScope.role === 2) {
                            $rootScope.paths = _.map(res.data.data.outlets, function(outlet) {
                                return '/' + outlet;
                            });
                            $cookies.put('paths', JSON.stringify($rootScope.paths));
                        } else {
                            $rootScope.paths = ['/console'];
                            $cookies.put('paths', JSON.stringify($rootScope.paths));
                        }
                        SweetAlert.swal({
                            title: 'Logged In Successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Continue',
                            closeOnConfirm: false
                        }, function() {
                            if (res.data.data.role === 2) {
                                $state.go('console.menus_manage', {}, {
                                    reload: true
                                });
                            } else {
                                $state.go('console.default', {}, {
                                    reload: true
                                });
                            }
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
