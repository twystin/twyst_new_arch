angular.module('consoleApp').controller('MenuUpdateRequestManageController', ['$scope', 'consoleRESTSvc',
    function($scope, consoleRESTSvc) {
        consoleRESTSvc.getAllEvents('menu_update').then(function(res) {
            console.log(res);
        }, function(err) {
            console.log(err);
        });
    }
]);
