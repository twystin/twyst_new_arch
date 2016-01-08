angular.module('consoleApp')
    .controller('RootController', function($scope, $rootScope, $state) {
        if (!$rootScope.token && ($state.current.name !== 'console.login')) {
            $state.go('console.login', {}, {
                reload: true
            });
        }

        $scope.logout = function() {
            consoleRESTSvc.logout().then(function(data) {
                if (data.response) {
                    $cookies.remove('token');
                    $rootScope.token = undefined;
                    toastr.success("Logged out successfully");
                    $state.go('console.login', {}, {
                        reload: true
                    });
                } else {
                    toastr.error(data.message, "Error");
                }
            }, function(err) {
                if (err.message) {
                    toastr.error(err.message, "Error");
                }
            });
        }
    });
