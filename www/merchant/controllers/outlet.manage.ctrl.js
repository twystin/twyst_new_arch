angular.module('merchantApp')
    .controller('OutletManageController', ['$scope', '$rootScope', 'merchantRESTSvc', 'SweetAlert',
        function($scope, $rootScope, merchantRESTSvc, SweetAlert) {

            $scope.filters = {
                name: '',
                locality1: '',
                locality2: '',
                city: ''
            }

            _id = undefined;

            $scope.getOutlets = function() {
                merchantRESTSvc.getOutlets().then(function(res) {
                    $scope.outlets = res.data;
                }, function(err) {
                    $scope.outlets = [];
                    console.log(err);
                })
            }

            $scope.removeOutlet = function(outlet_id) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this outlet',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: 'Yes, Delete It!',
                    closeOnConfirm: false
                }, function(confirm) {
                    if (confirm) {
                        merchantRESTSvc.deleteOutlet(outlet_id)
                            .then(function(data) {
                                SweetAlert.swal("SUCCESS", "Outlet deleted successfully", "success");
                                $scope.getOutlets();
                            }, function(err) {
                                SweetAlert.swal({
                                    title: 'ERROR',
                                    text: 'Unable to delete this outlet right now',
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: 'Continue',
                                    closeOnConfirm: true
                                });
                            });
                    }
                });
            }

            $scope.outletFilter = function(outlet) {
                var nameFilter = new RegExp($scope.filters.name, 'i'),
                    loc1Filter = new RegExp($scope.filters.locality1, 'i'),
                    loc2Filter = new RegExp($scope.filters.locality2, 'i'),
                    cityFilter = new RegExp($scope.filters.city, 'i');

                return (nameFilter.test(outlet.basics.name) && loc1Filter.test(outlet.contact.location.locality_1[0]) && loc2Filter.test(outlet.contact.location.locality_2[0]) && cityFilter.test(outlet.contact.location.city));
            }
        }
    ])
