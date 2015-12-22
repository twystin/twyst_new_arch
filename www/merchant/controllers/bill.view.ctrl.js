angular.module('merchantApp')
    .controller('BillViewController', ['$scope', 'merchantRESTSvc', 'SweetAlert', '$stateParams',
        function($scope, merchantRESTSvc, SweetAlert, $stateParams) {
            merchantRESTSvc.getBill($stateParams.bill_id)
                .then(function(res) {
                    $scope.bill = res.data;
                }, function(err) {
                    console.log(err);
                });

            $scope.approveBill = function() {
                $scope.bill.event_meta.status = 'outlet_approved';
                merchantRESTSvc.updatebill($scope.bill)
                    .then(function(res) {
                        $scope.bill = res.data;
                    }, function(err) {
                        console.log(err);
                    });
            };

            $scope.rejectBill = function() {
                $scope.bill.evnet_meta.status = 'outlet_rejected';
                merchantRESTSvc.updatebill($scope.bill)
                    .then(function(res) {
                        $scope.bill = res.data;
                    }, function(err) {
                        console.log(err);
                    });
            };
        }
    ]);
