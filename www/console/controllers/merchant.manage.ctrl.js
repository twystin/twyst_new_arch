angular.module('consoleApp')
    .controller('MerchantManageController', ['$scope', '$rootScope', 'consoleRESTSvc',
        function($scope, $rootScope, consoleRESTSvc) {
            consoleRESTSvc.getOutlets().then(function(res) {
                $scope.outlets = _.map(res.data, function(outlet) {
                    return {
                        name: outlet.basics.name,
                        loc1: outlet.contact.location.locality_1[0],
                        loc2: outlet.contact.location.locality_2[0],
                        pin: outlet.contact.location.pin
                    };
                });
            }, function(err) {
                console.log(err);
            });
        }
    ]);
