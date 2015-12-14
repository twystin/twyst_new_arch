angular.module('merchantApp')
    .controller('OfferViewController', ['$scope', 'merchantRESTSvc', '$q', 'SweetAlert', '$state', '$stateParams', '$filter',
        function($scope, merchantRESTSvc, $q, SweetAlert, $state, $stateParams, $filter) {

            $scope.today = new Date();
            $scope.today.setMilliseconds(0);
            $scope.today.setSeconds(0);
            $scope.today.setMinutes(0);
            $scope.today.setHours(0);

            $scope.max_date = new Date($scope.today.getTime() + (120 * 24 * 60 * 60 * 1000));
            $scope.max_date.setMilliseconds(999);
            $scope.max_date.setSeconds(59);
            $scope.max_date.setMinutes(59);
            $scope.max_date.setHours(23);

            $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            $scope.offer_types = {
                'checkin': 'Checkin Offer',
                'offer': 'Promoted offer'
            };

            $scope.reward_types = {
                'buyxgety': 'Buy X Get Y',
                'free': 'Free',
                'flatoff': 'Flat Off',
                'discount': 'Discount'
            };

            $scope.event_matches = {
                'on every': 'On Every',
                'after': 'After',
                'on only': 'On Only'
            };

            $scope.offer = {
                offer_status: 'draft',
                offer_type: '',
                user_sourced: false,
                offer_start_date: _.clone($scope.today),
                offer_end_date: new Date($scope.today.getTime() + (2 * 30 * 24 * 60 * 60 * 1000)),
                rule: {},
                actions: {
                    reward: {
                        reward_meta: {},
                        reward_hours: {
                            monday: {
                                closed: false,
                                timings: [{}]
                            },
                            tuesday: {
                                closed: false,
                                timings: [{}]
                            },
                            wednesday: {
                                closed: false,
                                timings: [{}]
                            },
                            thursday: {
                                closed: false,
                                timings: [{}]
                            },
                            friday: {
                                closed: false,
                                timings: [{}]
                            },
                            saturday: {
                                closed: false,
                                timings: [{}]
                            },
                            sunday: {
                                closed: false,
                                timings: [{}]
                            }
                        },
                        applicability: {
                            dine_in: true,
                            delivery: true
                        }
                    }
                },
                offer_items: {
                    all: true
                }
            };
            merchantRESTSvc.getOutlets()
                .then(function(res) {
                    $scope.outlets = _.indexBy(res.data.outlets, '_id');
                    console.log($scope.outlets);
                }, function(err) {
                    console.log(err);
                    SweetAlert.swal('Error getting outlets', err.message ? err.message : 'Something went wrong', 'error');
                    $scope.outlets = [];
                });

            merchantRESTSvc.getOffer($stateParams.offer_id)
                .then(function(res) {
                    if (res.data.offer_cost) {
                        res.data.offer_cost = res.data.offer_cost.toString();
                    }
                    $scope.offer = _.merge($scope.offer, res.data);
                    _.each($scope.offer.actions.reward.reward_hours, function(schedule) {
                        if (!schedule.is_closed) {
                            var time = new Date();
                            time.setSeconds(0);
                            time.setMilliseconds(0);
                            _.each(schedule.timings, function(timing) {
                                timing.open.time = _.clone(time);
                                timing.open.time.setHours(timing.open.hr);
                                timing.open.time.setMinutes(timing.open.min);

                                timing.close.time = _.clone(time);
                                timing.close.time.setHours(timing.close.hr);
                                timing.close.time.setMinutes(timing.close.min);
                            });
                        }
                    });
                }, function(err) {
                    console.log('erro', err);
                });
        }
    ]);
