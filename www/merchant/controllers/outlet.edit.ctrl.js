angular.module('merchantApp')
    .controller('OutletEditController', ['$scope', 'merchantRESTSvc', '$stateParams', '$rootScope', 'SweetAlert', '$state', '$q', '$modal', 'toastr',
        function($scope, merchantRESTSvc, $stateParams, $rootScope, SweetAlert, $state, $q, $modal, toastr) {

            $scope.cuisines = ["African", "American", "Andhra", "Arabic", "Armenian", "Asian", "Assamese", "Awadhi", "Bangladeshi", "Belgian", "Bengali", "Biryani", "British", "Burmese", "Chettinad", "Chinese", "Continental", "Costal", "Desserts", "European", "Fast Food", "Finger Food", "French", "German", "Goan", "Greek", "Gujarati", "Healthy Food", "Hyderabadi", "Ice creams", "Indian", "Indonesian", "Italian", "Japanese", "Kashmiri", "Konkan", "Malayali", "Korean", "Lebanese", "Lucknowi", "Maharashtrian", "Malaysian", "Mangalorean", "Mediterranean", "Mexican", "Moroccan", "Mughlai", "Naga", "Nepalese", "North Eastern", "North Indian", "Oriya", "Paan", "Pakistani", "Parsi", "Pizza", "Portuguese", "Punjabi", "Rajasthani", "Russian", "Sri Lankan", "Sindhi", "Singaporean", "South American", "South Indian", "Spanish", "Street Food", "Sushi", "Tex-Mex", "Thai", "Tibetan", "Turkish", "Vietnamese", "Wraps", "Bakery", "Beverages", "Burgers", "Cafe", "Salads", "Sandwiches", "Seafood", "Middle Eastern", "Steaks", "Sizzlers"];

            $scope.map = {
                center: {
                    latitude: 28.805422897457665,
                    longitude: 77.16647699812655
                },
                zoom: 14
            };
            $scope.map2 = {
                center: {
                    latitude: 28.805422897457665,
                    longitude: 77.16647699812655
                },
                zoom: 14,
                bounds: {}
            };

            $scope.drawingManagerOptions = {
                drawingMode: 'polygon',
                drawingControl: false,
                drawingControlOptions: {
                    position: 2,
                    drawingModes: ["polygon"]
                }
            };
            $scope.drawingManagerControl = {};
            $scope.drawingManagerEvents = {
                polygoncomplete: function(drawingManager, eventName, scope, args) {
                    var polygon = args[0];
                    var path = polygon.getPath().getArray();
                    var coord = _.map(path, function(coord) {
                        return {
                            latitude: coord.G,
                            longitude: coord.K
                        };
                    });
                    var index = $scope.outlet.attributes.delivery.delivery_zone.length - 1;
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'templates/partials/delivery_zone.tmpl.html',
                        size: 'lg',
                        controller: 'DeliveryZoneController',
                        resolve: {
                            delivery_zone: function() {
                                var orignal_coord = _.cloneDeep(coord);
                                var _zone = {
                                    coord: coord
                                };
                                if (index != -1) {
                                    _zone = _.merge(_zone, $scope.outlet.attributes.delivery.delivery_zone[index]);
                                }
                                _zone.coord = orignal_coord;
                                return _zone;
                            },
                            is_new: function() {
                                return true
                            },
                            is_first: function() {
                                if (index === -1) {
                                    return false;
                                }
                                return true;
                            }
                        }
                    });

                    modalInstance.result.then(function(delivery_zone) {
                        $scope.outlet.attributes.delivery.delivery_zone.push(delivery_zone);
                    }, function() {
                        polygon.setMap(null);
                    });

                }
            };

            $scope.editZone = function(index) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/partials/delivery_zone.tmpl.html',
                    size: 'lg',
                    controller: 'DeliveryZoneController',
                    resolve: {
                        delivery_zone: function() {
                            return _.cloneDeep($scope.outlet.attributes.delivery.delivery_zone[index]);
                        },
                        is_new: function() {
                            return false;
                        },
                        is_first: function() {
                            return false;
                        }
                    }
                });

                modalInstance.result.then(function(delivery_zone) {
                    $scope.outlet.attributes.delivery.delivery_zone[index] = delivery_zone;
                });
            };

            $scope.removeZone = function(index) {
                SweetAlert.swal({
                    title: 'Are you sure?',
                    text: 'This change is irreversable',
                    type: 'error',
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!"
                }, function(confirm) {
                    if (confirm) {
                        $scope.outlet.attributes.delivery.delivery_zone.splice(index, 1);
                    }
                });
            };

            $scope.isPaying = $rootScope.isPaying;

            $scope.outlet_types = [{
                value: 'bakery',
                name: 'Bakery'
            }, {
                value: 'cafe',
                name: 'Cafe'
            }, {
                value: 'delivery',
                name: 'Delivery Only'
            }, {
                value: 'desserts',
                name: 'Desserts'
            }, {
                value: 'pub_lounge',
                name: 'Pub/Lounge'
            }, {
                value: 'fast_food',
                name: 'QSR/Fast Food'
            }, {
                value: 'restaurant',
                name: 'Restaurant'
            }];

            $scope.outlet = {};

            _id = $stateParams.outlet_id;

            $scope.marker = {
                id: 0,
                coords: {
                    latitude: 28.6078341976,
                    longitude: 77.2465642784
                },
                options: {
                    draggable: true
                },
                events: {
                    dragend: function(marker, eventName, args) {
                        var lat = marker.getPosition().lat(),
                            lon = marker.getPosition().lng();

                        $scope.outlet.contact.location.coords.longitude = lon;
                        $scope.outlet.contact.location.coords.latitude = lat;
                        $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + lat + ',' + lon + '&z=' + $scope.map.zoom;
                        $scope.marker.options = {
                            draggable: true,
                            labelAnchor: "100 0",
                            labelClass: "marker-labels"
                        };

                    }
                }
            };

            $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            $scope.mapEvents = {
                click: function(binding, event_type, click_obj) {
                    var lat = click_obj[0].latLng.G,
                        lon = click_obj[0].latLng.K;

                    $scope.$apply(function() {
                        $scope.marker.coords = {
                            latitude: lat,
                            longitude: lon
                        };
                        $scope.outlet.contact.location.coords = {
                            longitude: lon,
                            latitude: lat
                        };
                        $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + lat + ',' + lon + '&z=' + $scope.map.zoom;
                    });
                }
            };

            $scope.updateMapMarker = function(latitude, longitude) {
                if ($scope.outlet.contact.location.coords.latitude !== latitude || !$scope.outlet.contact.location.coords.longitude !== longitude) {
                    $scope.outlet.contact.location.coords = {
                        latitude: latitude,
                        longitude: longitude
                    };
                }

                $scope.map.center = {
                    latitude: latitude,
                    longitude: longitude
                };
                $scope.map2.center = {
                    latitude: latitude,
                    longitude: longitude
                };

                $scope.marker.coords = {
                    latitude: latitude,
                    longitude: longitude
                };
                $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + latitude + ',' + longitude + '&z=' + $scope.map.zoom;
            };

            merchantRESTSvc.getLocations()
                .then(function(res) {
                    $scope.locations = res.data;
                }, function(err) {
                    $scope.locations = [];
                });

            merchantRESTSvc.getOutlets().then(function(res) {
                angular.forEach(res.data.outlets, function(outlet) {
                    if (outlet._id === $stateParams.outlet_id) {
                        $scope.outlet = angular.copy(outlet);
                        $scope.outlet.attributes.cost_for_two.min = $scope.outlet.attributes.cost_for_two.min.toString();
                        $scope.outlet.attributes.cost_for_two.max = $scope.outlet.attributes.cost_for_two.max.toString();
                        $scope.map.center = {
                            latitude: $scope.outlet.contact.location.coords.latitude,
                            longitude: $scope.outlet.contact.location.coords.longitude
                        };
                        $scope.map2.center = {
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

                        angular.forEach($scope.outlet.attributes.delivery.delivery_zone, function(zone) {
                            angular.forEach($scope.days, function(day) {
                                angular.forEach(zone.delivery_timings[day].timings, function(timing) {
                                    var open_time = new Date();
                                    var close_time = new Date();
                                    open_time.setMilliseconds(0);
                                    open_time.setSeconds(0);
                                    open_time.setHours(timing.open.hr);
                                    open_time.setMinutes(timing.open.min);
                                    close_time.setMilliseconds(0);
                                    close_time.setSeconds(0);
                                    close_time.setHours(timing.close.hr);
                                    close_time.setMinutes(timing.close.min);
                                    timing.open.time = open_time;
                                    timing.close.time = close_time;
                                });
                            });
                        });
                    }
                });
            }, function(err) {
                console.log('err', err);
            });

            $scope.mapOptions = {
                scrollwheel: true
            };

            $scope.addNumber = function(field_name) {
                if (!$scope.outlet.contact.phones[field_name]) {
                    $scope.outlet.contact.phones[field_name] = [];
                }
                var num = {
                    num: '',
                    num_type: 'mobile'
                };

                $scope.outlet.contact.phones[field_name].push(num);
            };

            $scope.removeNumber = function(list, index) {
                list.splice(index, 1);
            };

            $scope.addCuisine = function(newCuisine) {
                if (!newCuisine) {
                    return;
                }

                if (!$scope.outlet.attributes.cuisines) {
                    $scope.outlet.attributes.cuisines = [];
                }

                if ($scope.outlet.attributes.cuisines.indexOf(newCuisine) === -1) {
                    $scope.outlet.attributes.cuisines.push(newCuisine);
                }
            };

            $scope.removeCuisine = function(index) {
                $scope.outlet.attributes.cuisines.splice(index, 1);
            };

            $scope.updateCommission = function() {
                if ($scope.outlet.twyst_meta.twyst_commission.is_fixed) {
                    $scope.outlet.twyst_meta.twyst_commission.commission_slab = [];
                } else {
                    delete $scope.outlet.twyst_meta.twyst_commission.value;
                    $scope.outlet.twyst_meta.twyst_commission.commission_slab = [{
                        has_upper_bound: true
                    }];
                }
            };

            $scope.addCommissionSlab = function() {
                $scope.outlet.twyst_meta.twyst_commission.commission_slab.push({
                    has_upper_bound: true
                });
            };

            $scope.removeSlab = function(index) {
                $scope.outlet.twyst_meta.twyst_commission.commission_slab.splice(index, 1);
            };

            $scope.updateSMSOff = function() {
                if (!$scope.outlet.sms_off.value) {
                    $scope.outlet.sms_off.time = {};
                } else {
                    $scope.outlet.sms_off.time = {
                        start: {
                            hr: 23,
                            min: 0
                        },
                        end: {
                            hr: 9,
                            min: 0
                        }
                    };
                }
            };

            $scope.updateTiming = function(day, list) {
                if (list[day].closed) {
                    list[day].timings = [];
                } else {
                    list[day].timings = [{}];
                }
            };

            $scope.initalizeTiming = function(day, index, list) {
                if (list[day].timings[index].open && list[day].timings[index].close) {
                    return;
                }

                var openTime = new Date();
                if ($rootScope.isPaying) {
                    openTime.setHours(9);
                    openTime.setMinutes(0);
                    openTime.setSeconds(0);
                    openTime.setMilliseconds(0);
                } else {
                    openTime.setHours(0);
                    openTime.setMinutes(1);
                    openTime.setSeconds(0);
                    openTime.setMilliseconds(0);
                }

                var closeTime = new Date();
                if ($rootScope.isPaying) {
                    closeTime.setHours(21);
                    closeTime.setMinutes(0);
                    closeTime.setSeconds(0);
                    closeTime.setMilliseconds(0);
                } else {
                    closeTime.setHours(0);
                    closeTime.setMinutes(0);
                    closeTime.setSeconds(0);
                    closeTime.setMilliseconds(0);
                }

                if ($rootScope.isPaying) {
                    list[day].timings[index] = {
                        open: {
                            hr: 9,
                            min: 0,
                            time: openTime
                        },
                        close: {
                            hr: 21,
                            min: 0,
                            time: closeTime
                        }
                    };
                } else {
                    list[day].timings[index] = {
                        open: {
                            hr: 0,
                            min: 1,
                            time: openTime
                        },
                        close: {
                            hr: 0,
                            min: 0,
                            time: closeTime
                        }
                    };
                }
            };

            $scope.updateTime = function(day, index, list) {
                var _timing = list[day].timings[index];

                if (_timing.open.time) {
                    _timing.open.hr = _timing.open.time.getHours();
                    _timing.open.min = _timing.open.time.getMinutes();
                }
                if (_timing.close.time) {
                    _timing.close.hr = _timing.close.time.getHours();
                    _timing.close.min = _timing.close.time.getMinutes();
                }
            };

            $scope.chooseImage = function() {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/partials/background_picker.html',
                    size: 'lg',
                    controller: 'ImagePickerController'
                });

                modalInstance.result.then(function(selectedItem) {
                    var img_obj = {};
                    img_obj['source'] = selectedItem;
                    img_obj['image_type'] = 'background';
                    if (_id) {
                        img_obj['id'] = _id;
                    }
                    imageSvc.cloneImage(img_obj).then(function(res) {
                        $scope.outlet.photos.background = 'asd';
                        $scope.outlet.photos.background = res.data.key;
                        toastr.success('Image set successfully');
                    }, function(err) {
                        console.log(err);
                    });
                }, function(err) {
                    console.info('Modal dismissed at: ' + new Date(), err);
                });
            };

            $scope.getMaxRange = function() {
                return new Array(_.reduce($scope.outlet.business_hours, function(obj1, obj2) {
                    if (!_.has(obj1, 'timings')) {
                        return obj1 >= obj2.timings.length ? obj1 : obj2.timings.length;
                    } else {
                        return obj1.timings.length > obj2.timings.length ? obj1.timings.length : obj2.timings.length;
                    }
                }));
            }

            $scope.addNewTiming = function(day, list) {
                list[day].timings.push({});
            };

            $scope.removeTiming = function(day, index, list) {
                list[day].timings.splice(index, 1);
            };

            $scope.cloneToAllDays = function(the_day, list) {
                _.each(list, function(schedule, day) {
                    if (day !== the_day) {
                        schedule.timings = _.cloneDeep(list[the_day].timings);
                        schedule.closed = list[the_day].closed;
                    }
                });
            };

            $scope.updateOutlet = function() {
                merchantRESTSvc.updateOutlet($scope.outlet)
                    .then(function(res) {
                        SweetAlert.swal({
                            title: 'Outlet updated successfully',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Continue'
                        }, function() {
                            $state.go('^.outlets_manage', {}, {
                                reload: true
                            });
                        });
                    }, function(err) {
                        console.log(err);
                        var message = err.message ? err.message : 'Something went wrong';
                        SweetAlert.swal('Service error', message, 'error');
                    });
            };

            $scope.scrollToTop = function() {
                $('document').ready(function() {
                    $(window).scrollTop(0);
                });
            };

            $scope.showErrorMessage = function(text) {
                $scope.formFailure = true;
                SweetAlert.swal({
                    title: 'Validation Error',
                    text: text,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    closeOnConfirm: true
                });
            };

            $scope.validateStep1 = function() {
                $scope.formFailure = false;
                var deferred = $q.defer();
                if (!_.get($scope.outlet, 'basics.name')) {
                    $scope.showErrorMessage('Outlet name is mandatory');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'contact.location.address')) {
                    $scope.showErrorMessage('Complete address is mandatory');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'contact.location.city')) {
                    $scope.showErrorMessage('City must be selected');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'contact.location.locality_2[0]')) {
                    $scope.showErrorMessage('Locality 2 must be specified');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'links.short_url[0]')) {
                    $scope.showErrorMessage('Short code cannot be left blank');
                } else if ((!_.get($scope.outlet, 'contact.location.coords.longitude') && $scope.outlet.contact.location.coords.longitude !== 0) || (!_.get($scope.outlet, 'contact.location.coords.latitude') && $scope.outlet.contact.location.coords.latitude !== 0)) {
                    $scope.showErrorMessage('Geo-location data is missing');
                    deferred.reject();
                } else {
                    async.each($scope.outlet.contact.phones.mobile, function(number, callback) {
                        if (!number.num) {
                            callback("One or more outlet numbers left blank");
                        } else if ((number.num_type == 'mobile' && !/^[0-9]{10}$/.test(number.num)) || (number.num_type == 'landline' && !/^[0-9]{11}$/.test(number.num))) {
                            callback("One or more outlet numbers are invalid");
                        } else {
                            callback();
                        }
                    }, function(err) {
                        if (err) {
                            $scope.showErrorMessage(err);
                            deferred.reject();
                        } else {
                            async.each($scope.outlet.contact.phones.reg_mobile, function(number, callback) {
                                if (!number.num) {
                                    callback("One or more registered mobile numbers left blank");
                                } else if (!/^[0-9]{10,11}$/.test(number.num)) {
                                    callback("One or more registered mobile numbers are invalid");
                                } else {
                                    callback();
                                }
                            }, function(err) {
                                if (err) {
                                    $scope.showErrorMessage(err);
                                    deferred.reject();
                                } else if (!_.get($scope.outlet, 'contact.emails.person') && $rootScope.isPaying) {
                                    $scope.showErrorMessage("Contact person's name required");
                                    deferred.reject();
                                } else if (!_.get($scope.outlet, 'contact.emails.email') && $rootScope.isPaying) {
                                    $scope.showErrorMessage("Contact person's Email ID required");
                                    deferred.reject();
                                } else if (!_.get($scope.outlet, 'basics.account_mgr_email')) {
                                    $scope.showErrorMessage("Account manager's email ID required");
                                } else {
                                    $scope.scrollToTop();
                                    $scope.formFailure = false;
                                    deferred.resolve(true);
                                }
                            });
                        }
                    });
                }
                return deferred.promise;
            };

            $scope.validateStep2 = function() {
                var deferred = $q.defer();
                if (!_.get($scope.outlet, 'basics.main_type')) {
                    $scope.showErrorMessage("Please choose an outlet type");
                    deferred.reject();
                } else if ((!_.get($scope.outlet, 'attributes.cost_for_two.min') || !_.get($scope.outlet, 'attributes.cost_for_two.max')) && $rootScope.isPaying) {
                    $scope.showErrorMessage('Please provide both minimum and maximum "Cost for Two"');
                    deferred.reject();
                } else if (!$scope.outlet.attributes.dine_in && !$scope.outlet.attributes.home_delivery && $rootScope.isPaying) {
                    $scope.showErrorMessage('Outlet must have atleast dine-in or delivery available');
                    deferred.reject();
                } else if (!$scope.outlet.attributes.cuisines.length && $rootScope.isPaying) {
                    $scope.showErrorMessage('Atleast one cuisine must be specified');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'twyst_meta.cashback.min') && $scope.outlet.twyst_meta.cashback.min !== 0) {
                    $scope.showErrorMessage('Minimum cashback amount required');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'twyst_meta.cashback.max') && $scope.outlet.twyst_meta.cashback.max !== 0) {
                    $scope.showErrorMessage('Maximum cashback amount required');
                    deferred.reject();
                } else if ($scope.outlet.twyst_meta.twyst_commission.is_fixed && !$scope.outlet.twyst_meta.twyst_commission.value) {
                    $scope.showErrorMessage("Fixed commission value must be specified");
                    deferred.reject();
                } else if (!$scope.outlet.twyst_meta.twyst_commission.is_fixed && !($scope.outlet.twyst_meta.twyst_commission.commission_slab && $scope.outlet.twyst_meta.twyst_commission.commission_slab.length)) {
                    $scope.showErrorMessage("Atleast one commission slab must be provided");
                    deferred.reject();
                } else {
                    async.each($scope.outlet.twyst_meta.twyst_commission.commission_slab, function(slab, callback) {
                        if (!slab.start && slab.start !== 0) {
                            callback("All slabs require valid start amount");
                        } else if (slab.has_upper_bound && !slab.end && slab.end !== 0) {
                            callback("End amount missing for slab with upper bound");
                        } else if (!slab.value && slab.value !== 0) {
                            callback("Commission amount required for all slabs");
                        } else {
                            callback();
                        }
                    }, function(err) {
                        if (err) {
                            $scope.showErrorMessage(err);
                            deferred.reject();
                        } else if ($scope.outlet.sms_off.value) {
                            if ((!$scope.outlet.sms_off.time.start.hr && $scope.outlet.sms_off.time.start.hr !== 0) || (!$scope.outlet.sms_off.time.start.min && $scope.outlet.sms_off.time.start.min !== 0)) {
                                $scope.showErrorMessage("SMS OFF start time invalid");
                                deferred.reject();
                            } else if ((!$scope.outlet.sms_off.time.end.hr && $scope.outlet.sms_off.time.end.hr !== 0) || (!$scope.outlet.sms_off.time.end.min && $scope.outlet.sms_off.time.end.min !== 0)) {
                                $scope.showErrorMessage("SMS OFF end time invalid");
                                deferred.reject();
                            } else {
                                var startMin = ($scope.outlet.sms_off.time.start.hr * 60) + $scope.outlet.sms_off.time.start.min,
                                    closeMin = ($scope.outlet.sms_off.time.end.hr * 60) + $scope.outlet.sms_off.time.end.min;
                                if (startMin == closeMin) {
                                    $scope.showErrorMessage("SMS Off start and end time cannot be the same");
                                    deferred.reject();
                                } else {
                                    $scope.scrollToTop();
                                    $scope.formFailure = false;
                                    deferred.resolve(true);
                                }
                            }
                        } else {
                            $scope.scrollToTop();
                            $scope.formFailure = false;
                            deferred.resolve(true);
                        }
                    });
                }
                return deferred.promise;
            };

            $scope.validateStep3 = function() {
                var deferred = $q.defer();
                async.each(Object.keys($scope.outlet.business_hours), function(day, callback) {
                    var schedule = $scope.outlet.business_hours[day];
                    if (schedule.closed) {
                        callback();
                    } else {
                        async.each(schedule.timings, function(timing1, callback) {
                            if ((!timing1.open.hr && timing1.open.hr !== 0) || (!timing1.open.min && timing1.open.min !== 0) || (!timing1.close.hr && timing1.close.hr !== 0) || (!timing1.close.min && timing1.close.min !== 0)) {
                                callback("One or more timings invalid for " + day.toUpperCase())
                            } else {
                                async.each(schedule.timings, function(timing2, callback) {
                                    if ((!timing2.open.hr && timing2.open.hr !== 0) || (!timing2.open.min && timing2.open.min !== 0) || (!timing2.close.hr && timing2.close.hr !== 0) || (!timing2.close.min && timing2.close.min !== 0)) {
                                        callback("One or more timings invalid for " + day.toUpperCase())
                                    } else {
                                        var startMin1 = (timing1.open.hr * 60) + timing1.open.min,
                                            closeMin1 = (timing1.close.hr * 60) + timing1.close.min,
                                            startMin2 = (timing2.open.hr * 60) + timing2.open.min,
                                            closeMin2 = (timing2.close.hr * 60) + timing2.close.min;

                                        if (timing1 == timing2) {
                                            callback();
                                        } else if (((startMin1 <= closeMin2) && (closeMin2 <= closeMin1)) || ((startMin1 <= startMin2) && (startMin2 <= closeMin1)) || ((startMin2 <= closeMin1) && (closeMin1 <= closeMin2))) {
                                            callback("One or more timings invalid for " + day.toUpperCase());
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
                        })
                    }
                }, function(err) {
                    if (err) {
                        $scope.showErrorMessage(err);
                        deferred.reject();
                    } else {
                        $scope.scrollToTop();
                        $scope.formFailure = false;
                        deferred.resolve(true);
                    }
                });
                return deferred.promise;
            };

            $scope.validateStep4 = function() {
                var deferred = $q.defer();
                if (!_.get($scope.outlet, 'photos.logo')) {
                    $scope.showErrorMessage('Logo is mandatory');
                    deferred.reject();
                } else if (!_.get($scope.outlet, 'photos.background')) {
                    $scope.showErrorMessage('Background image is mandatory');
                    deferred.reject();
                } else {
                    $scope.scrollToTop();
                    $scope.formFailure = false;
                    deferred.resolve(true);
                }
                return deferred.promise;
            };

        }
    ])
