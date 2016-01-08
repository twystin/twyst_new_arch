angular.module('consoleApp').controller('BillViewController', ['$scope', 'SweetAlert', 'consoleRESTSvc', '$stateParams',
    function($scope, SweetAlert, consoleRESTSvc, $stateParams) {
        $scope.updateCheck = function(check, isChecked) {
            $scope[check] = isChecked ? true : false
        };

        consoleRESTSvc.getOutlets().then(function(res) {
            $scope.outlets = _.map(res.data, function(outlet) {
                return {
                    _id: outlet._id,
                    name: outlet.basics.name,
                    address: outlet.contact.location.address,
                    locality_1: outlet.contact.location.locality_1[0],
                    locality_2: outlet.contact.location.locality_2[0],
                    city: outlet.contact.location.city,
                    pin: outlet.contact.location.pin
                }
            });

        }, function(err) {
            if (err.message) {
                SweetAlert.swal("ERROR", err.message, "Error");
            }
            console.log(err);
        })

        consoleRESTSvc.getEvent($stateParams.bill_id).then(function(res) {
            console.log(res);
            if (res.data.data.event_meta.timestamp) {
                res.data.data.event_meta.timestamp = new Date(res.data.data.event_meta.timestamp);
            }
            $scope.bill = res.data.data;

            if (res.data.pending) {
                $scope.pending = angular.copy(res.data.pending);

            }

        }, function(err) {
            if (err.message) {
                SweetAlert.swal("ERROR", err.message, "Error");
            }
            console.log(err);
        });

        $scope.approveBill = function() {
            if (!$scope.bill.event_meta.bill_number) {
                SweetAlert.swal("Validation error", "Bill Number required", "error");
            } else if (!$scope.bill.event_meta.timestamp) {
                SweetAlert.swal("Validation error", "Bill date and time required", "error");
            } else if (!$scope.bill.event_meta.bill_amount) {
                SweetAlert.swal("Validation error", "Bill amount required", "error");
            } else {
                if (!$scope.bill.event_meta.issued_for) {
                    $scope.bill.event_meta.status = 'twyst_approved';
                } else {
                    $scope.bill.event_meta.status = 'outlet_pending';
                }

                consoleRESTSvc.updateEvent($scope.bill).then(function(res) {
                    SweetAlert.swal("SUCCESS", res.message, "success");
                    $scope.bill = res.data;
                }, function(err) {
                    if (err.message) {
                        SweetAlert.swal("ERROR", err.message, "error");
                    }
                    console.log(err);
                });
            }
        }

        $scope.updateOutletId = function(outlet) {
            $scope.bill.event_outlet = outlet._id;
        }

        $scope.rejectBill = function() {
            $scope.bill.event_meta.is_rejected = true;
            $scope.bill.event_meta.status = 'twyst_rejected';

            if ($scope.isDuplicate) {
                $scope.bill.event_meta.status = 'archived';
                $scope.bill.event_meta.reason = 'Bill is duplicate';
            } else if (!$scope.isBill) {
                $scope.bill.event_meta.reason = 'Image is not of a bill.';
            } else if (!$scope.isClear) {
                $scope.bill.event_meta.reason = 'Bill image is either unclear, incomplete, or manipulated.';
            } else if (!$scope.isListed) {
                $scope.bill.event_meta.reason = 'Outlet is not listed on Twyst.';
            } else {
                $scope.bill.event_meta.reason = '';
            }

            if ($scope.bill.event_meta.reason) {
                consoleRESTSvc.updateEvent($scope.bill).then(function(res) {
                    $scope.bill = res.data;
                    console.log($scope.bill)
                    $scope.isClear = $scope.isBill = $scope.isListed = false;
                    SweetAlert.swal("SUCCESS", res.message, "success");
                }, function(err) {
                    if (err.message) {
                        SweetAlert.swal("ERROR", err.message, "error");
                    }
                    console.log(err);
                });
            } else {
                SweetAlert.swal("Validation Error", "No criteria to base rejection on", "error");
            }
        }

        $scope.linkRedemption = function(item) {
            $scope.bill.event_meta.issued_for = item.issued_for;
            $scope.bill.event_meta.pending_coupon = item._id;
        }
    }
]);
