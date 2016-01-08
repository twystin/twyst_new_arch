angular.module('consoleApp').controller('OfferViewController', ['$scope', 'consoleRESTSvc', '$stateParams', 'SweetAlert',
    function($scope, consoleRESTSvc, $stateParams, SweetAlert) {

        $scope.outlets = {};
        $scope.offer = {};

        $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        $scope.reward_types = {
            'buyonegetone': 'Buy One Get One',
            'discount': 'Discount',
            'flatoff': 'Flat Off',
            'free': 'Free',
            'happyhours': 'Happy Hours',
            'reduced': 'Reduced Price',
            'custom': 'Custom',
            'unlimited': 'Unlimited',
            'onlyhappyhours': 'Only Happy Hours',
            'combo': 'Combo',
            'buffet': 'Buffet',
            'buyxgety': 'Buy X Get Y'
        };

        consoleRESTSvc.getOutlets().then(function(res) {
            console.log(res);
            $scope.outlets = _.indexBy(res.data, '_id');
        }, function(err) {
            console.log(err);
        });

        consoleRESTSvc.getOffer($stateParams.offer_id).then(function(res) {
            console.log(res);
            if (res.data.offer_cost) {
                res.data.offer_cost = res.data.offer_cost.toString();
            }

            $scope.offer = _.merge($scope.offer, res.data);
            console.log($scope.offer);
            angular.forEach($scope.offer.actions.reward.reward_hours, function(schedule) {
                if (!schedule.closed) {
                    angular.forEach(schedule.timings, function(timing) {
                        timing.open.time = new Date();
                        timing.close.time = new Date();
                        timing.open.time.setMilliseconds(0);
                        timing.open.time.setSeconds(0);
                        timing.close.time.setMilliseconds(0);
                        timing.close.time.setSeconds(0);
                        timing.open.time.setHours(timing.open.hr);
                        timing.open.time.setMinutes(timing.open.min);
                        timing.close.time.setHours(timing.close.hr);
                        timing.close.time.setMinutes(timing.close.min);
                    });
                }
            });
        }, function(err) {
            console.log(err);
        });

        $scope.updateOfferStatus = function(offer) {
            consoleRESTSvc.updateOfferStatus(offer).then(function(res) {
                console.log(res);
                SweetAlert.swal("SUCCESS", "Offer status updated", 'success');
            }, function(err) {
                console.log(err);
                if (err.message) {
                    SweetAlert.swal('ERROR', err.message, 'error');
                } else {
                    SweetAlert.swal('ERROR', 'Unable to update the offer status right now', 'error');
                }
            });
        };
    }
])
