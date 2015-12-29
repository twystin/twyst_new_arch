angular.module('merchantApp')
    .controller('OrderManageController', ['$scope', 'merchantRESTSvc', 'SweetAlert', '$state', '$q', '$modal', '$rootScope',
        function($scope, merchantRESTSvc, SweetAlert, $state, $q, $modal, $rootScope) {
            $scope.showing = "pending";

            $scope.updateShowing = function(text) {
                $scope.showing = text;
            };

            $scope.maxDate = new Date();
            $scope.minDate = new Date($scope.maxDate.getTime() - (7 * 24 * 60 * 60 * 1000));

            $scope.checkin = {
                date: new Date()
            };

            $scope.search = {};

            $scope.choosen_outlet;

            merchantRESTSvc.getOutlets().then(function(res) {
                $scope.outlets = _.indexBy(res.data.outlets, '_id');
                if (Object.keys($scope.outlets).length) {
                    $scope.choosen_outlet = res.data.outlets[0]._id;
                    $scope.getOrders();
                }
            }, function(err) {
                console.log(err);
                $socpe.outlets = {};
            });

            $scope.orders = [];

            $scope.$watchCollection('choosen_outlet', function(newVal, oldVal) {
                if (!newVal) {
                    return;
                }

                if (newVal !== oldVal && oldVal !== undefined) {
                    $rootScope.faye.unsubscribe('/' + oldVal);
                }

                $rootScope.faye.subscribe('/' + newVal, function(message) {
                    $scope.$apply(function() {
                        SweetAlert.swal({
                            title: 'New Order',
                            text: message.text,
                            type: 'info'
                        }, function(confirm) {
                            if (confirm) {
                                $scope.getOrders();
                            }
                        });
                    });
                });
            });

            $scope.getOrders = function() {
                merchantRESTSvc.getOrders($scope.choosen_outlet).then(function(res) {
                    console.log(res);
                }, function(err) {
                    console.log(err);
                });
            }


            $scope.orders.push({
                "_id": "56794462b6a6a6231406f320",
                "outlet": "5316d59326b019ee59000026",
                "order_number": "TWCG1-1115-KL5X",
                "order_value_without_offer": 500,
                "order_value_with_offer": 400,
                "order_actual_cost": 400,
                "amount_paid": 400,
                "tax_paid": 12,
                "cash_back": 20,
                "delivery_charge": 0,
                "estimate_time": 30,
                "order_status": "pending",
                "user": {
                    "_id": "5493e99cc9c13a127929fcaf",
                    "email": "hemantwadhwa47@gmail.com",
                    "phone": "7838250206"
                },
                "items": [{
                    "item_id": "56740f13b6188687102c8be4",
                    "item_name": "Veg Calzone",
                    "item_description": "",
                    "item_photo": "",
                    "item_tags": ["calzone"],
                    "item_cost": 135,
                    "_id": "56794462b6a6a6231406f321",
                    "addons": [],
                    "item_quantity": 2,
                    "option_id": "5673fd82b6188687102c8b71",
                    "option": "6 inch",
                    "option_cost": 177,
                    "sub_options": [{
                        "_id": "5673fd82b6188687102c8b72",
                        "sub_option_title": "Options",
                        "sub_option_set": [{
                            "_id": "56740f13b6188687102c8be2",
                            "sub_option_value": "Chicken Keema Khaasa",
                            "is_vegetarian": false,
                            "sub_option_cost": 0
                        }]
                    }],
                }],
                "is_favourite": false,
                "order_date": "2015-12-22T12:38:42.729Z",
                "address": {
                    "line1": "A 5/16",
                    "line2": "DLF Phase 1",
                    "landmark": "Kutubplaza",
                    "pin": 123456,
                    "city": "Gurgaon",
                    "state": "Haryana",
                    "delivery_zone": "zone1",
                    "tags": "office",
                    "coords": {
                        "lat": "744112",
                        "long": "123456"
                    }
                },
                "payment_info": {
                    "mode": "cod"
                },
                "__v": 0
            });

            $scope.getItemPrice = function(item) {
                var total_price = 0;
                if (!item.option) {
                    return item.item_cost;
                } else {
                    total_price += item.option_cost;
                    if (item.sub_options && item.sub_options.length) {
                        for (var i = 0; i < item.sub_options.length; i++) {
                            total_price += item.sub_options[i].sub_option_set[0].sub_option_cost;
                        }
                    }
                    return total_price;
                }
            };

            $scope.updateEstimateTime = function(order, delta) {
                order.estimate_time += delta;
            }

            $scope.getDiscount = function(order) {
                return (order.order_value_without_offer - order.order_value_with_offer) + (order.order_value_with_offer * (order.cash_back / 100));
            }

            $scope.checkinUser = function() {
                if (!$scope.checkin || !$scope.checkin.number) {
                    SweetAlert.swal('Number required', 'Please enter the customer\'s mobile number', 'warning');
                } else if (!/^[0-9]{10}$/.test($scope.checkin.number)) {
                    SweetAlert.swal('Invalid number!', 'Number entered is invalid. Please recheck', 'warning');
                } else {
                    var req_obj = {
                        event_meta: {
                            phone: $scope.checkin.number
                        },
                        event_outlet: $scope.choosen_outlet
                    };
                    if ($scope.checkin.date) {
                        var today = new Date();
                        $scope.checkin.date.setHours(today.getHours());
                        $scope.checkin.date.setMinutes(today.getMinutes());
                        req_obj.event_date = $scope.checkin.date;
                        req_obj.event_meta.date = new Date();
                    }
                    merchantRESTSvc.checkinUser(req_obj)
                        .then(function(res) {
                            $scope.checkin.number = '';
                            if (!_.has(res, 'data.checkins_to_go')) {

                                // checkin successfull with voucher generated

                                // console.log(res.data);
                                // $scope.show_vouchers = true;
                                // $scope.user_vouchers = [res.data];
                                // success_msg = "Checkin successfull, User also unlocked a coupon";
                            } else {

                                // checkin successfull with voucher generated

                                // success_msg = "Checkin successfull";
                            }
                        }, function(err) {
                            $scope.checkin.number = '';
                            var error_msg;
                            if (err.data.indexOf('-') === -1) {
                                error_msg = err.data;
                            } else {
                                error_msg = err.data.slice(err.data.indexOf('-') + 2)
                            }
                            SweetAlert.swal('ERROR', error_msg, 'error');
                        });
                }
            }

            $scope.getVoucherByCode = function() {
                console.log($scope.search);
                if (!$scope.search.code || $scope.search.code.length !== 6) {
                    SweetAlert.swal('Missing/Invalid Voucher Code','Please provide a valid voucher code to search', 'error');
                } else {
                    merchantRESTSvc.getVoucherByCode($scope.choosen_outlet, $scope.search.code)
                        .then(function(data) {
                            $scope.search = {};
                            if (data.data) {
                                // show voucher in modal
                                $modal.open({
                                    animation: true,
                                    templateUrl: 'templates/partials/panel.voucher.tmpl.html',
                                    size: 'lg',
                                    controller: 'PanelVoucherController',
                                    resolve: {
                                        vouchers: function() {
                                            return [data.data];
                                        },
                                        outlet: function() {
                                            return $scope.choosen_outlet;
                                        }
                                    }
                                });
                                console.log(data);
                            } else {
                                SweetAlert.swal('Not Found', 'No active voucher found with that code', 'warning');
                            }
                        }, function(err) {
                            SweetAlert.swal('Error', err.message?err.message:'Something went wrong', 'error');
                        });
                }
            }

            $scope.getVouchersByPhone = function() {
                if (!$scope.search || !$scope.search.number) {
                    SweetAlert.swal('Missing number', 'Please enter the customer\'s number to search', 'warning');
                } else if (!/^[0-9]{10}$/.test($scope.search.number)) {
                    SweetAlert.swal('Invalid number', 'Phone number entered is invalid. Please recheck', 'error');
                } else {
                    merchantRESTSvc.getVouchersByPhone($scope.choosen_outlet, $scope.search.number)
                        .then(function(data) {
                            $scope.search = {};
                            if (!data.data.length) {
                                SweetAlert.swal('No active vouchers', 'No active vouchers found for the customer');
                            } else {
                                $modal.open({
                                    animation: true,
                                    templateUrl: 'templates/partials/panel.voucher.tmpl.html',
                                    size: 'lg',
                                    controller: 'PanelVoucherController',
                                    resolve: {
                                        vouchers: function() {
                                            return data.data;
                                        },
                                        outlet: function() {
                                            return $scope.choosen_outlet;
                                        }
                                    }
                                });
                                console.log(data);
                            }
                        }, function(err) {
                            SweetAlert.swal('ERROR', err.message?err.message: 'Something went wrong', 'error');
                        });
                }
            }
        }
    ]);
