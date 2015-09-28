angular.module('baseApp')
    .controller('BaseController', ['$scope', '$window',
        function($scope, $window) {
            $('.navbar.navbar-fixed-top').affix({
                offset: {
                    top: 100
                }
            })

            $scope.copyright = new Date();
        }
    ]);