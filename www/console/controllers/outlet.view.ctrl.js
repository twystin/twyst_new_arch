angular.module('consoleApp').controller('OutletViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$stateParams', '$modal',
    function($scope, toastr, consoleRESTSvc, $stateParams, $modal) {
        
        $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // consoleRESTSvc.getAllOutlets().then(function(data) {
        //     $scope.outlet = _.find(data.data, function(outlet) {
        //         return outlet._id === $stateParams.outlet_id;
        //     });
        //     if ($scope.outlet) {
        //         _.each(days, function(day) {
        //             _.each($scope.outlet.business_hours[day].timings, function(timing) {
        //                 var
        //             })
        //         })
        //     }
        //     console.log($scope.outlet);
        //     console.log(data);
        // }, function(err) {
        //     console.log(err);
        // });

		$scope.map = { center: { latitude: 28.805422897457665, longitude: 77.16647699812655 }, zoom: 14 };
		$scope.marker = { id: 0, coords: { latitude: 28.6078341976, longitude: 77.2465642784 } };

        consoleRESTSvc.getAllOutlets().then(function(res) {
            angular.forEach(res.data, function(outlet) {
                if (outlet._id == $stateParams.outlet_id) {
                    $scope.outlet = angular.copy(outlet);
                    $scope.outlet.attributes.cost_for_two.min = $scope.outlet.attributes.cost_for_two.min.toString();
                    $scope.outlet.attributes.cost_for_two.max = $scope.outlet.attributes.cost_for_two.max.toString();
                    $scope.map.center = {
                        latitude: $scope.outlet.contact.location.coords.latitude,
                        longitude: $scope.outlet.contact.location.coords.longitude
                    };
                    $scope.marker.coords = {
                        latitude: $scope.outlet.contact.location.coords.latitude,
                        longitude: $scope.outlet.contact.location.coords.longitude
                    };
                    angular.forEach($scope.outlet.business_hours, function(schedule) {
                        angular.forEach(schedule.timings, function(timing) {
                            var _time = new Date();
                            _time.setHours(timing.open.hr);
                            _time.setMinutes(timing.open.min);
                            _time.setSeconds(0);
                            _time.setMilliseconds(0);
                            timing.open.time = _.clone(_time);
                            _time.setHours(timing.close.hr);
                            _time.setMinutes(timing.close.min);
                            timing.close.time = _.clone(_time);
                        });
                    });
                }
            });
        }, function(err) {
            $log.log('err', err);
        });

        $scope.listQrCodes = function() {
            console.log($modal);
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'templates/partials/qrListTemplate.html',
                controller: 'QrListController',
                size: 'lg',
                resolve: {
                    outlet_id: function() {
                        return $stateParams.outlet_id
                    }
                }
            });

            modalInstance.result.then(function(selectedQr) {
                console.log(selectedQr);
            }, function() {
                console.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.createQrCode = function() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'templates/partials/qrCreateTemplate.html',
                controller: 'QrCreateController',
                size: 'lg',
                resolve: {
                    outlet_id: function() {
                        return $stateParams.outlet_id
                    }
                }
            });

            modalInstance.result.then(function(created_qrs) {
                console.log(created_qrs);
            }, function() {
                console.info('Modal dismissed at: ' + new Date());
            });
        };
    }
]).controller('QrListController', function($scope, $modalInstance, consoleRESTSvc, outlet_id) {
    $scope.per_page = 12;
    $scope.current_page = 1;
    consoleRESTSvc.getQRs(outlet_id).then(function(data) {
        $scope.qrs = data.data;
        $scope.visible_qrs = $scope.qrs.slice(($scope.current_page - 1) * $scope.per_page, $scope.current_page * $scope.per_page);
        $scope.qrCount = $scope.qrs.length;
    }, function(err) {
        console.log(err);
    });

    $scope.filterQRs = function(reset_page) {
        if(reset_page) {
            $scope.current_page = 1;
        }

        if(!$scope.qrFilter) {
            $scope.visible_qrs = $scope.qrs.slice(($scope.current_page - 1) * $scope.per_page, $scope.current_page * $scope.per_page);
            $scope.qrCount = $scope.qrs.length;
        } else {
            var regex = new RegExp($scope.qrFilter, 'i');
            var filtered_qrs = _.filter($scope.qrs, function(qr) {
                return regex.test(qr.code) ||  regex.test(qr.outlet_id.basics.name) || regex.test(qr.outlet_id.contact.location.locality_1[0]) || regex.test(qr.outlet_id.contact.location.locality_2[0]);
            });
            $scope.qrCount = filtered_qrs.length;
            $scope.visible_qrs = filtered_qrs.slice(($scope.current_page-1)*$scope.per_page, ($scope.current_page)*$scope.per_page);
        }
    }
}).controller('QrCreateController', function($scope, $modalInstance, consoleRESTSvc, outlet_id, toastr) {

    $scope.minDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    $scope.maxDate = new Date(Date.now() + (180 * 24 * 60 * 60 * 1000));

    $scope.qr_req = {
        outlet: outlet_id,
        num: 1,
        type: 'single',
        max_use_limit: 1,
    };

    $scope.updateOutletId = function(item) {
        $scope.qr_req.outlet = item._id;
    }

    $scope.updateQrLimit = function() {
        if($scope.qr_req.type==='single') {
            $scope.qr_req.max_use_limit = 1;
        } else {
            $scope.qr_req.max_use_limit = 5;
        }
    }

    $scope.updateValidityEnd = function() {
        if(!$scope.qr_req.validity || !$scope.qr_req.validity.start) {
            return;
        }
        $scope.qr_req.validity.end = new Date($scope.qr_req.validity.start.getTime() + (30*24*60*60*1000));
    }

    $scope.generateQR = function() {
        if (!$scope.qr_req.outlet) {
            toastr.error("Please choose an outlet first", "Outlet missing");
        } else if (!$scope.qr_req.num) {
            toastr.error("Please provide the number of QRs required", "QR count missing");
        } else if (!$scope.qr_req.type) {
            toastr.error("Please specify a QR type ", "QR type missing");
        } else if (!$scope.qr_req.max_use_limit) {
            toastr.error("Please specify a QR usage limit");
        } else if (!$scope.qr_req.max_use_limit) {
            toastr.error("Please specify a max usage limit", "Usage limit missing");
        } else if (!$scope.qr_req.validity || !$scope.qr_req.validity.start || !$scope.qr_req.validity.end) {
            toastr.error("Both validity start and end are mandatory", "Validity info missing");
        } else  if(new Date($scope.qr_req.validity.start.getTime() + (7*24*60*60*1000))>$scope.qr_req.validity.end) {
                toastr.error("QR must be valid for alteast one week", "Validity duration invalid.");
        } else {
            consoleRESTSvc.createQr($scope.qr_req).then(function(data) {
                console.log(data);
                $scope.generated_qrs = data.data
            }, function(err) {
                if(err.message) {
                    toastr.error(err.message, "Error");
                } else {
                    toastr.error("Something went wrong", "Error");
                }
            });
        }
    }

    $scope.closeModal = function() {
        $modalInstance.close($scope.generated_qrs);
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }

    console.log(outlet_id);
})