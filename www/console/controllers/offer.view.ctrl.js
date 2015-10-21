angular.module('consoleApp').controller('OfferViewController', ['$scope', 'toastr', 'consoleRESTSvc', '$stateParams',
    function($scope, toastr, consoleRESTSvc, $stateParams) {

        consoleRESTSvc.getAllOutlets().then(function(data) {
        	console.log(data);
            $scope.outlets = _.indexBy(data.data, '_id');
        }, function(err) {
            $log.log('Could not get outlets - ' + err.message);
            $scope.outlets = [];
        });
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
            'buffet': 'Buffet'
        };

        consoleRESTSvc.getOffer($stateParams.offer_id).then(function(data) {
        	console.log(data);
            if (data.data.offer_cost) {
                data.data.offer_cost = data.data.offer_cost.toString();
            }
            $scope.offer = _.merge({}, data.data);
            angular.forEach($scope.offer.actions.reward.reward_hours, function(schedule) {
                if (!schedule.closed) {
                    angular.forEach(schedule.timings, function(timing) {
                        timing.open.time = new Date(),
                            timing.close.time = new Date();
                        timing.open.time.setSeconds(0);
                        timing.open.time.setMilliseconds(0);
                        timing.close.time.setSeconds(0);
                        timing.close.time.setMilliseconds(0);
                        timing.open.time.setHours(timing.open.hr);
                        timing.open.time.setMinutes(timing.open.min);
                        timing.close.time.setHours(timing.close.hr);
                        timing.close.time.setMinutes(timing.close.min);
                    });
                }
            });
        }, function(err) {
            console.log('err', err);
        });

		$scope.updateOfferStatus = function(offer) {
			consoleRESTSvc.updateOfferStatus(offer)
				.then(function(res) {
					console.log(res);
					toastr.success("Offer status updated")
				}, function(err) {
					if(err.message) {
						toastr.error(err.message);
					} else {
						toastr.error("Unable to update the offer status right now");
					}
					console.log(err);
				});
		}

    }
])