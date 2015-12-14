angular.module('merchantApp')
    .controller('OfferManageController', ['$scope', 'merchantRESTSvc', 'SweetAlert',
        function($scope, merchantRESTSvc, SweetAlert) {
            _id = undefined;

            $scope.filters = {
                header: '',
                line1: '',
                line2: '',
                offer_type: '',
                reward_type: ''
            }

            $scope.offerFilter = function(offer) {
                var headerFilter = new RegExp($scope.filters.header, 'i'),
                    line1Filter = new RegExp($scope.filters.line1, 'i'),
                    line2Filter = new RegExp($scope.filters.line2, 'i'),
                    oTypeFilter = new RegExp($scope.filters.offer_type, 'i'),
                    rTypeFilter = new RegExp($scope.filters.reward_type, 'i');

                return (headerFilter.test(offer.actions.reward.header) && line1Filter.test(offer.actions.reward.line1) && line2Filter.test(offer.actions.reward.line2) && rTypeFilter.test(offer.actions.reward.reward_meta.reward_type) && oTypeFilter.test(offer.offer_type));
            }

            $scope.getOffers = function() {
                merchantRESTSvc.getOutlets().then(function(data) {
                    $scope.outlets = data.data.outlets;
                    $scope.offers = [];
                    $scope.offer_ids = [];
                    _.each($scope.outlets, function(outlet) {
                        _.each(outlet.offers, function(offer) {
                            if ($scope.offer_ids.indexOf(offer._id) === -1) {
                                $scope.offer_ids.push(offer._id);
                                $scope.offers.push(offer);
                            }
                        });
                    });
                }, function(err) {
                    $scope.offers = [];
                    var message = err.message ? err.message : 'Something went wrong';
                    SweetAlert.swal({
                        title: 'ERROR',
                        text: message,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: 'Continue',
                        closeOnConfirm: true
                    });
                });
            }

            $scope.removeOffer = function(offer_id) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'You will not be able to recover this offer',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: 'Yes, Delete It!',
                    closeOnConfirm: false
                }, function(confirm) {
                    if (confirm) {
                        merchantRESTSvc.deleteOffer(offer_id)
                            .then(function(data) {
                                SweetAlert.swal("SUCCESS", "Offer deleted successfully", "success");
                                $scope.getOffers();
                            }, function(err) {
                                SweetAlert.swal({
                                    title: 'ERROR',
                                    text: 'Unable to delete this offer right now',
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
        }
    ])
