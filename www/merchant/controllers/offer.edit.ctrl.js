angular.module('merchantApp')
    .controller('OfferEditController', ['$scope', 'merchantRESTSvc', '$q', 'SweetAlert', '$state', '$stateParams', '$filter', '$modal', 'WizardHandler',
        function($scope, merchantRESTSvc, $q, SweetAlert, $state, $stateParams, $filter, $modal, WizardHandler) {

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

            $scope.menus = [];
            merchantRESTSvc.getAllMenus().then(function(res) {
                _.each(res.data, function(menu) {
                    if (!$scope.outlet_id) {
                        $scope.outlet_id = menu.outlet._id;
                        $scope.menus.push(menu);
                    } else if ($scope.outlet_id === menu.outlet._id) {
                        $scope.menus.push(menu);
                    }
                });
            });

            merchantRESTSvc.getOutlets()
                .then(function(res) {
                    $scope.outlets = _.indexBy(res.data.outlets, '_id');
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

            $scope.$watchCollection('offer.offer_type', function(newVal, oldVal) {
                if (!newVal) {
                    return;
                } else if (newVal === 'offer') {
                    if (Object.keys($scope.offer.rule).length) {
                        $scope.offer.rule = {};
                    }
                    if (!$scope.offer.offer_cost) {
                        $scope.offer.offer_cost = '100';
                    }
                }
            });

            $scope.$watchCollection('offer.rule', function(newVal, oldVal) {
                var ordinal = $filter('ordinal');
                if (newVal.event_match !== oldVal.event_match && oldVal.event_match !== undefined) {
                    $scope.offer.rule.friendly_text = '';
                    $scope.offer.rule = {
                        event_match: newVal.event_match
                    };
                } else if (newVal.event_match) {
                    if (newVal.event_match === 'on every' && newVal.event_count && (newVal.event_start || newVal.event_start === 0) && newVal.event_end) {
                        newVal.friendly_text = 'Applicable on every ' + ordinal(newVal.event_count) + ' checkin from ' + ordinal(newVal.event_start) + ' to ' + ordinal(newVal.event_end) + ' checkin.';
                    } else if (newVal.event_match === 'after' && (newVal.event_start || newVal.event_start === 0) && newVal.event_end) {
                        newVal.friendly_text = 'Applicable on every checkin from ' + ordinal(newVal.event_start) + ' to ' + ordinal(newVal.event_end) + ' checkin.';
                    } else if (newVal.event_match === 'on only' && (newVal.event_count || newVal.event_count === 0)) {
                        newVal.friendly_text = 'Applicable on the ' + ordinal(newVal.event_count) + ' checkin.';
                    } else {
                        newVal.friendly_text = '';
                    }
                }
            });

            $scope.$watchCollection('offer.offer_items', function(newVal, oldVal) {
                console.log('newVal', newVal);
                if (($scope.offer.actions.reward.reward_meta.reward_type === 'buyxgety' || $scope.offer.actions.reward.reward_meta.reward_type === 'free') && $scope.offer.offer_items && $scope.offer.offer_items.menu_id) {
                    $scope.getRewardName($scope.offer.offer_items).then(function(free_item_name) {
                        $scope.offer.actions.reward.reward_meta.free_item_name = free_item_name;
                    }, function(err) {
                        console.log(err);
                    });
                }
            });

            $scope.$watchCollection('offer.actions.reward.reward_meta', function(newVal, oldVal) {
                if (!newVal.reward_type) {
                    return;
                }
                console.log(newVal);
                if (newVal.reward_type === 'buyxgety') {
                    if (oldVal.reward_type !== 'buyxgety') {
                        console.log(oldVal);
                        $scope.offer.offer_items = {
                            all: true
                        };
                        delete newVal.free_item;
                    }
                    if ($scope.offer.offer_items && $scope.offer.offer_items.menu_id) {
                        $scope.getRewardName($scope.offer.offer_items).then(function(free_item_name) {
                            newVal.free_item_name = free_item_name;
                        }, function(err) {
                            console.log(err);
                        });
                    }
                    if (newVal.paid_item) {
                        $scope.getRewardName(newVal.paid_item).then(function(paid_item_name) {
                            if (newVal.paid_item && (!newVal.paid_item.paid_item_name || newVal.paid_item.paid_item_name !== paid_item_name)) {
                                var paid_item = _.cloneDeep(newVal.paid_item);
                                paid_item.paid_item_name = paid_item_name;
                                newVal.paid_item = paid_item;
                            }
                        }, function(err) {
                            console.log(err);
                        });
                    }
                    if (newVal.paid_item && $scope.offer.offer_items && $scope.offer.offer_items.menu_id) {
                        $scope.offer.actions.reward.header = 'Buy ' + (newVal.paid_item && newVal.paid_item.paid_item_name);
                        $scope.offer.actions.reward.line1 = 'Get ' + newVal.free_item_name;
                        $scope.offer.actions.reward.line2 = '';
                    } else {
                        $scope.offer.actions.reward.header = '';
                        $scope.offer.actions.reward.line1 = '';
                        $scope.offer.actions.reward.line2 = '';
                    }
                } else if (newVal.reward_type === 'free') {
                    if (oldVal.reward_type && oldVal.reward_type !== 'free') {
                        $scope.offer.offer_items = {
                            all: true
                        };
                        delete newVal.paid_item;
                        delete newVal.free_item_name;
                    }
                    if ($scope.offer.offer_items && $scope.offer.offer_items.menu_id) {
                        $scope.offer.actions.reward.header = 'FREE';
                        $scope.offer.actions.reward.line1 = newVal.free_item_name;
                        $scope.offer.actions.reward.line2 = '';
                    } else {
                        $scope.offer.actions.reward.header = '';
                        $scope.offer.actions.reward.line1 = '';
                        $scope.offer.actions.reward.line2 = '';
                    }
                } else if (newVal.reward_type === 'flatoff') {
                    if (oldVal.reward_type && oldVal.reward_type !== 'flatoff') {
                        delete newVal.free_item;
                        delete newVal.paid_item;
                        $scope.offer.offer_items = {
                            all: true
                        };
                    }
                    if (newVal.off && newVal.spend) {
                        $scope.offer.actions.reward.header = 'Rs. ' + newVal.off + ' off';
                        $scope.offer.actions.reward.line1 = 'on a min spend';
                        $scope.offer.actions.reward.line2 = 'of Rs. ' + newVal.spend;
                    } else {
                        $scope.offer.actions.reward.header = '';
                        $scope.offer.actions.reward.line1 = '';
                        $scope.offer.actions.reward.line2 = '';
                    }
                } else if (newVal.reward_type === 'discount') {
                    if (oldVal.reward_type && oldVal.reward_type !== 'flatoff') {
                        delete newVal.paid_item;
                        $scope.offer.offer_items = {
                            all: true
                        };
                        delete newVal.free_item_name;
                    }
                    if (newVal.percent && newVal.max) {
                        $scope.offer.actions.reward.header = newVal.percent + '% OFF';
                        $scope.offer.actions.reward.line1 = 'on your bill';
                        $scope.offer.actions.reward.line2 = 'max discount Rs.' + newVal.max;
                    } else {
                        $scope.offer.actions.reward.header = '';
                        $scope.offer.actions.reward.line1 = '';
                        $scope.offer.actions.reward.line2 = '';
                    }
                }
            });

            $scope.chooseItem = function(item_for, item_only) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/partials/offer.pick_item.tmpl.html',
                    controller: 'PickItemController',
                    size: 'md',
                    resolve: {
                        item_only: function() {
                            return item_only;
                        }
                    }
                });

                modalInstance.result.then(function(item) {
                    if (item_for !== 'buyxgety_2') {
                        $scope.offer.offer_items = _.clone(item);
                        $scope.offer.offer_items.all = false;
                    }

                    if (item_for === 'buyxgety_2') {
                        $scope.offer.actions.reward.reward_meta.paid_item = _.clone(item);
                    }
                });
            };

            $scope.removeOutlet = function(index) {
                if ($scope.offer.offer_outlets) {
                    $scope.offer.offer_outlets.splice(index, 1);
                }
            };

            $scope.addOutlet = function(newOutlet) {
                if (!newOutlet) {
                    return;
                }

                if (!$scope.offer.offer_outlets) {
                    $scope.offer.offer_outlets = [newOutlet];
                    $scope.cloneTimings({
                        _id: newOutlet
                    });
                } else if ($scope.offer.offer_outlets.indexOf(newOutlet) === -1) {
                    $scope.offer.offer_outlets.push(newOutlet);
                }
            };

            $scope.cloneTimings = function(obj) {
                if (obj._id) {
                    $scope.offer.actions.reward.reward_hours = _.indexBy(_.map(Object.keys($scope.outlets[obj._id].business_hours), function(day) {
                        var timings = _.map($scope.outlets[obj._id].business_hours[day].timings, function(timing) {
                            delete timing._id;
                            var time = new Date();
                            time.setSeconds(0);
                            time.setMilliseconds(0);
                            timing.open.time = _.clone(time);
                            timing.open.time.setMinutes(timing.open.min);
                            timing.open.time.setHours(timing.open.hr);
                            timing.close.time = _.clone(time);
                            timing.close.time.setMinutes(timing.close.min);
                            timing.close.time.setHours(timing.close.hr);
                            return _.cloneDeep(timing);
                        });

                        return {
                            day: day,
                            timings: timings,
                            closed: $scope.outlets[obj._id].business_hours[day].closed
                        };
                    }), 'day');
                    obj._id = '';
                }
            };

            $scope.getMaxRange = function() {
                return new Array(_.reduce($scope.offer.actions.reward.reward_hours, function(obj1, obj2) {
                    if (!_.has(obj1, 'timings')) {
                        return obj1 >= obj2.timings.length ? obj1 : obj2.timings.length;
                    } else {
                        return obj1.timings.length > obj2.timings.length ? obj1.timings.length : obj2.timings.length;
                    }
                }));
            };

            $scope.updateOffer = function() {
                merchantRESTSvc.updateOffer($scope.offer)
                    .then(function(res) {
                        SweetAlert.swal({
                            title: 'Offer updated successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Continue'
                        }, function() {
                            $state.go('^.offers_manage', {}, {
                                reload: true
                            });
                        });
                    }, function(err) {
                        var message = err.message ? err.message : 'Something went wrong';
                        SweetAlert.swal('Service error', message, 'error');
                    });
            };

            $scope.backToStart = function() {
                WizardHandler.wizard().goTo(0);
            }

            $scope.scrollToTop = function() {
                $('document').ready(function() {
                    $(window).scrollTop(0);
                });
            };

            $scope.validateStep1 = function() {
                var deferred = $q.defer();

                var _showValidationError = function(message) {
                    $scope.formFailure = true;
                    SweetAlert.swal('Validation Error', message, 'error');
                    deferred.reject();
                };

                $scope.validateOfferType().then(function() {
                    $scope.validateOfferRules().then(function() {
                        $scope.validateRewardDetails().then(function() {
                            $scope.validateRewardInfo().then(function() {
                                $scope.scrollToTop();
                                $scope.formFailure = false;
                                deferred.resolve(true);
                            }, _showValidationError);
                        }, _showValidationError)
                    }, _showValidationError)
                }, _showValidationError)
                return deferred.promise;
            };

            $scope.validateStep2 = function() {
                var deferred = $q.defer();

                var _showValidationError = function(message) {
                    $scope.formFailure = true;
                    SweetAlert.swal('Validation Error', message, 'error');
                    deferred.reject();
                };

                $scope.validateOfferTerms().then(function() {
                    $scope.validateOfferTimings().then(function() {
                        $scope.validateAgainstOutlets().then(function() {
                            $scope.validateOfferValidity().then(function() {
                                $scope.scrollToTop();
                                $scope.formFailure = false;
                                deferred.resolve(true);
                            }, _showValidationError);
                        }, _showValidationError);
                    }, _showValidationError);
                }, _showValidationError);
                return deferred.promise;
            };

            $scope.validateOfferType = function() {
                var deferred = $q.defer();
                if (!$scope.offer.offer_type) {
                    deferred.reject('Offer type must be selected');
                } else if ($scope.offer.user_sourced && (!$scope.offer.offer_user_source || !/^[a-zA-Z0-9]{24}$/i.test($scope.offer.offer_user_source))) {
                    deferred.reject('Valid user ID required for user sourced offers');
                } else {
                    deferred.resolve(true);
                }
                return deferred.promise;
            };

            $scope.validateOfferRules = function() {
                var deferred = $q.defer();
                if ($scope.offer.offer_type !== 'checkin') {
                    deferred.resolve(true);
                } else if (!$scope.offer.rule.event_match) {
                    deferred.reject('Offer criteria required');
                } else if ($scope.offer.rule.event_match === 'on every') {
                    if (!$scope.offer.rule.event_count) {
                        deferred.reject('Valid checkin repeat required');
                    } else if (!$scope.offer.rule.event_start && $scope.offer.rule.event_start !== 0) {
                        deferred.reject('Valid start checkin required')
                    } else if (!$scope.offer.rule.event_end) {
                        deferred.reject('Valid end checkin required');
                    } else if (($scope.offer.rule.event_count > ($scope.offer.rule.event_end - $scope.offer.rule.event_start)) || ($scope.offer.rule.event_start >= $scope.offer.rule.event_end)) {
                        deferred.reject("Atleast two checkins must be possible from start to end checkin");
                    } else {
                        deferred.resolve(true);
                    }
                } else if ($scope.offer.rule.event_match === 'after') {
                    if (!$scope.offer.rule.event_start && $scope.offer.rule.event_start !== 0) {
                        deferred.reject('Valid offer start checkin count required');
                    } else if (!$scope.offer.rule.event_end) {
                        deferred.reject('Valid offer end checkin count required');
                    } else if ($scope.offer.rule.event_end <= $scope.offer.rule.event_start) {
                        deferred.reject('Offer rule end checkin must be after start checkin count');
                    } else {
                        deferred.resolve(true);
                    }
                } else if ($scope.offer.rule.event_match === 'on only') {
                    if (!$scope.offer.rule.event_count) {
                        deferred.reject('Valid checkin number required');
                    } else {
                        deferred.resolve(true);
                    }
                }
                return deferred.promise;
            };

            $scope.validateRewardDetails = function() {
                var deferred = $q.defer();
                if (!$scope.offer.actions.reward.reward_meta.reward_type) {
                    deferred.reject('Choose a reward type');
                } else if ($scope.offer.actions.reward.reward_meta.reward_type === 'buyxgety') {
                    if (!$scope.offer.offer_items.menu_id) {
                        deferred.reject('Buy X Get Y requires "FREE ITEM"');
                    } else if (!$scope.offer.actions.reward.reward_meta.paid_item) {
                        deferred.reject('Buy X Get Y requires "PAID ITEM"');
                    } else {
                        deferred.resolve(true);
                    }
                } else if ($scope.offer.actions.reward.reward_meta.reward_type === 'free') {
                    if (!$scope.offer.offer_items || !$scope.offer.offer_items.menu_id) {
                        deferred.reject('Please choose the "FREE ITEM"');
                    } else {
                        deferred.resolve(true);
                    }
                } else if ($scope.offer.actions.reward.reward_meta.reward_type === 'flatoff') {
                    if (!$scope.offer.actions.reward.reward_meta.off) {
                        deferred.reject('Flatoff required off amount.');
                    } else if (!$scope.offer.actions.reward.reward_meta.spend) {
                        deferred.reject('Flatoff required minimum spend.');
                    } else {
                        deferred.resolve(true);
                    }
                } else if ($scope.offer.actions.reward.reward_meta.reward_type === 'discount') {
                    if (!$scope.offer.actions.reward.reward_meta.percent) {
                        deferred.reject("Valid discount percentage required");
                    } else if (!$scope.offer.actions.reward.reward_meta.max) {
                        deferred.reject("Max discount amount required");
                    } else {
                        deferred.resolve(true);
                    }
                } else {
                    deferred.reject('Valid reward type required');
                }
                return deferred.promise;
            };

            $scope.validateRewardInfo = function() {
                var deferred = $q.defer();
                if (!$scope.offer.actions.reward.header) {
                    deferred.reject('Header cannot be left blank');
                } else if (!$scope.offer.actions.reward.line1) {
                    deferred.reject('Line 1 cannot be left blank');
                } else {
                    deferred.resolve(true);
                }
                return deferred.promise;
            };

            $scope.validateOfferTerms = function() {
                var deferred = $q.defer();
                if (!$scope.offer.minimum_bill_value && $scope.offer.minimum_bill_value !== 0) {
                    deferred.reject("Minimum bill value required");
                } else if (!$scope.offer.actions.reward.applicability.dine_in && !$scope.offer.actions.reward.applicability.delivery) {
                    deferred.reject('Offer cannot be invalid for both dine-in and delivery');
                } else if (!$scope.offer.offer_lapse_days && $scope.offer.offer_type === 'checkin') {
                    deferred.reject('Offer lapse duration required');
                } else if (!$scope.offer.offer_valid_days && $scope.offer.offer_type === 'checkin') {
                    deferred.reject('Offer expiration duration required');
                } else if (!$scope.offer.offer_cost && $scope.offer.offer_type === 'offer') {
                    deferred.reject('Offer cost required');
                } else {
                    deferred.resolve(true);
                }
                return deferred.promise;
            };

            $scope.validateOfferTimings = function() {
                var deferred = $q.defer();
                if (!$scope.offer.offer_outlets || !$scope.offer.offer_outlets.length) {
                    deferred.reject('Select atleast one outlet');
                } else {
                    async.each($scope.days, function(day, callback) {
                        var schedule = $scope.offer.actions.reward.reward_hours[day];
                        if (schedule.closed) {
                            callback();
                        } else {
                            async.each(schedule.timings, function(timing1, callback) {
                                if ((!timing1.open.hr && timing1.open.hr !== 0) || (!timing1.open.min && timing1.open.min !== 0) || (!timing1.close.hr && timing1.close.hr !== 0) || (!timing1.close.min && timing1.close.min !== 0)) {
                                    callback('One or more offer timings are invalid for ' + day.toUpperCase());
                                } else {
                                    async.each(schedule.timings, function(timing2, callback) {
                                        if ((!timing2.open.hr && timing2.open.hr !== 0) || (!timing2.open.min && timing2.open.min !== 0) || (!timing2.close.hr && timing2.close.hr !== 0) || (!timing2.close.min && timing2.close.min !== 0)) {
                                            callback('One or more offer timings are invalid for ' + day.toUpperCase());
                                        } else {
                                            var startMin1 = (timing1.open.hr * 60) + timing1.open.min,
                                                closeMin1 = (timing1.close.hr * 60) + timing1.close.min,
                                                startMin2 = (timing2.open.hr * 60) + timing2.open.min,
                                                closeMin2 = (timing2.close.hr * 60) + timing2.close.min;

                                            if (timing1 === timing2) {
                                                callback();
                                            } else if (((startMin1 <= closeMin2) && (closeMin2 <= closeMin1)) || ((startMin1 <= startMin2) && (startMin2 <= closeMin1)) || ((startMin2 <= closeMin1) && (closeMin1 <= closeMin2))) {
                                                callback('One or more offer timings invalid for ' + day.toUpperCase());
                                            } else {
                                                callback();
                                            }
                                        }
                                    }, function(err) {
                                        callback(err);
                                    });
                                }
                            }, function(err) {
                                callback(err);
                            });
                        }
                    }, function(err) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(true);
                        }
                    });
                }
                return deferred.promise;
            };

            $scope.validateAgainstOutlets = function() {
                var deferred = $q.defer();
                async.each($scope.days, function(day, callback) {
                    var offer_schedule = $scope.offer.actions.reward.reward_hours[day];
                    if (offer_schedule.closed) {
                        callback();
                    } else {
                        async.each(offer_schedule.timings, function(offer_timing, callback) {
                            var offerOpenMin = (offer_timing.open.hr * 60) + offer_timing.open.min,
                                offerCloseMin = (offer_timing.close.hr * 60) + offer_timing.close.min;

                            async.each($scope.offer.offer_outlets, function(outletId, callback) {
                                var outlet = $scope.outlets[outletId];
                                var outlet_schedule = outlet.business_hours[day];

                                if (offerCloseMin <= offerOpenMin) {
                                    offerCloseMin += (24 * 60);
                                }

                                if (outlet_schedule.closed) {
                                    callback('Offer available on ' + day.toUpperCase() + ' despite outlet ' + outlet.basics.name + ' being closed.');
                                } else {
                                    async.each(outlet_schedule.timings, function(outlet_timing, callback) {
                                        var outletOpenMin = (outlet_timing.open.hr * 60) + outlet_timing.open.min,
                                            outletCloseMin = (outlet_timing.close.hr * 60) + outlet_timing.close.min;

                                        if (outletCloseMin <= outletOpenMin) {
                                            outletCloseMin += (24 * 60);
                                        }

                                        if (outletOpenMin <= offerOpenMin && offerCloseMin <= outletCloseMin) {
                                            callback('found');
                                        } else {
                                            callback();
                                        }
                                    }, function(found_or_error) {
                                        callback(found_or_error);
                                    });
                                }
                            }, function(found_or_error) {
                                if (found_or_error === 'found') {
                                    callback();
                                } else if (found_or_error) {
                                    callback(found_or_error);
                                } else {
                                    callback('Offer available on ' + day.toUpperCase() + ' outside the timings for all outlets.');
                                }
                            });
                        }, function(err) {
                            callback(err);
                        });
                    }
                }, function(err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(true);
                    }
                });
                return deferred.promise;
            };

            $scope.validateOfferValidity = function() {
                var deferred = $q.defer();
                if (!$scope.offer.offer_start_date || $scope.offer.offer_start_date > $scope.max_date) {
                    deferred.reject('Offer required valid start date.');
                } else if (!$scope.offer.offer_end_date || $scope.offer.offer_end_date > $scope.max_date) {
                    deferred.reject('Offer required valid end date.');
                } else if (!$scope.offer.offer_start_date >= $scope.offer.offer_end_date) {
                    deferred.reject('Offer start date cannot be before or same as offer end date');
                } else if (!$scope.offer.offer_outlets || !$scope.offer.offer_outlets.length) {
                    deferred.reject('Please select atleast one outlet');
                } else {
                    deferred.resolve(true);
                }
                return deferred.promise;
            };

            $scope.getRewardName = function(item_obj) {
                var deferred = $q.defer();
                async.each($scope.menus, function(menu, callback) {
                    if (menu._id !== item_obj.menu_id) {
                        callback();
                    } else {
                        async.each(menu.menu_categories, function(category, callback) {
                            if (category._id !== item_obj.category_id) {
                                callback();
                            } else if (!item_obj.sub_category_id) {
                                callback('All ' + category.category_name);
                            } else {
                                async.each(category.sub_categories, function(sub_category, callback) {
                                    if (sub_category._id !== item_obj.sub_category_id) {
                                        callback();
                                    } else if (!item_obj.item_id) {
                                        callback('All ' + sub_category.sub_category_name);
                                    } else {
                                        async.each(sub_category.items, function(item, callback) {
                                            if (item._id !== item_obj.item_id) {
                                                callback();
                                            } else if (!item_obj.option_id) {
                                                callback(item.item_name);
                                            } else {
                                                async.each(item.options, function(option, callback) {
                                                    if (option._id !== item_obj.option_id) {
                                                        callback();
                                                    } else if ((!item_obj.sub_options || !item_obj.sub_options.length)) {
                                                        callback(item.item_name + ' - ' + option.option_value);
                                                    } else {
                                                        var item_name = '';
                                                        async.each(option.sub_options, function(sub_option, callback) {
                                                            async.each(sub_option.sub_option_set, function(sub_opt, callback) {
                                                                if (item_obj.sub_options.indexOf(sub_opt._id) !== -1) {
                                                                    item_name += ', ' + sub_opt.sub_option_value;
                                                                    callback();
                                                                } else {
                                                                    callback();
                                                                }
                                                            }, function() {
                                                                callback();
                                                            });
                                                        }, function() {
                                                            item_name = item_name.slice(2);
                                                            item_name += ' ' + item.item_name + ' - ' + option.option_value;
                                                            var index = item_name.lastIndexOf(',');
                                                            if (index !== -1) {
                                                                item_name = item_name.slice(0, index) + ' or' + item_name.slice(index + 1);
                                                            }
                                                            callback(item_name);
                                                        });
                                                    }
                                                }, function(item_name) {
                                                    callback(item_name);
                                                });
                                            }
                                        }, function(item_name) {
                                            callback(item_name);
                                        });
                                    }
                                }, function(item_name) {
                                    callback(item_name);
                                });
                            }
                        }, function(item_name) {
                            callback(item_name);
                        });
                    }
                }, function(item_name) {
                    if (item_name) {
                        deferred.resolve(item_name);
                    } else {
                        deferred.reject('error');
                    }
                });
                return deferred.promise;
            };

            $scope.getRange = function(num) {
                return new Array(num);
            };

        }
    ]);
