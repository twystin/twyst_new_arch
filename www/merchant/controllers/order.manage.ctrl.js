angular.module('merchantApp')
    .controller('OrderManageController', ['$scope', 'merchantRESTSvc', 'SweetAlert', '$state', '$q', '$modal',
        function($scope, merchantRESTSvc, SweetAlert, $state, $q, $modal) {
            $scope.showing = "pending";

            $scope.updateShowing = function(text) {
                $scope.showing = text;
            };

            merchantRESTSvc.getOutlets().then(function(res) {
            	$scope.outlets = _.indexBy(res.data.outlets, '_id');
            	if(Object.keys($scope.outlets).length) {
            		$scope.choosen_outlet = res.data.outlets[0]._id;
            	}
            }, function(err) {
            	console.log(err);
            	console.log($scope.outlets);
            });

            $scope.orders = [];

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
                return (order.order_value_without_offer - order.order_value_with_offer) + (order.order_value_with_offer * (order.cash_back/100));
            }
        }
    ]);
