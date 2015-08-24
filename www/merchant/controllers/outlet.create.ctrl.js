merchantApp.controller('OutletCreateCtrl', ['$scope', '$cookies', '$log', '$state', 'twystRESTSvc', 'toastr', '$stateParams', '$http', '$q', function($scope, $cookies, $log, $state, twystRESTSvc, toastr, $stateParams, $http, $q) {
    $scope.isCollapsed = false;

    $scope.tag_set = ['desserts', 'restaurant', 'biryani', 'chinese', 'conntinental', 'north_indian', 'fast_food', 'burgers', 'pizza', 'wraps', 'pub', 'beer', 'bakery', 'cake', 'cafe', 'bistro', 'takeaway', 'other'];
    $scope.weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    $scope.payment_options = ['cash', 'visa', 'master', 'amex', 'sodexho'];
    $scope.checkModel = {};

    $scope.map = {center: {latitude: 28.805422897457665, longitude: 77.16647699812655 }, zoom: 10 };
    $scope.options = {scrollwheel: true};

    $scope.attribute_set = [{
        class_name: 'home_delivery',
        text: 'Home Delivery?'
    }, {
        class_name: 'dine_in',
        text: 'Dine-in Available?'
    }, {
        class_name: 'veg',
        text: 'Pure Vegitarian?'
    }, {
        class_name: 'alcohol',
        text: 'Serves alcohol'
    }, {
        class_name: 'outdoor',
        text: 'Outdoor sitting'
    }, {
        class_name: 'foodcourt',
        text: 'Inside a food court'
    }, {
        class_name: 'smoking',
        text: 'Smoking allowed?'
    }, {
        class_name: 'chain',
        text: 'Part of a chain?'
    }];

    $http.get('/api/v4/outlets')
        .success(function(res) {
            $scope.outlet = _.extend(res, $scope.outlet);
        })
        .error(function(err) {
            console.error('error', err);
        })

    $scope.outlet= {
        _id: '55d30deee1faf5bfa0d81c35',
        attributes: {
            payment_options: [],
            delivery: {
                delivery_timings: {
                    monday: {
                        closed: false,
                        timings: [{

                        }]
                    },
                    tuesday: {
                        closed: false,
                        timings: [{

                        }]
                    },
                    wednesday: {
                        closed: false,
                        timings: [{

                        }]
                    },
                    thursday: {
                        closed: false,
                        timings: [{

                        }]
                    },
                    friday: {
                        closed: false,
                        timings: [{

                        }]
                    },
                    saturday: {
                        closed: false,
                        timings: [{

                        }]
                    },
                    sunday: {
                        closed: false,
                        timings: [{

                        }]
                    }
                }
            }
        },
    	contact: {
	    	location: {
	    		coords: {

	    		},
                landmarks: []
	    	},
	    	phones: {

	    	},
	    	emails: {
	    		type: 'work'
	    	}
	    },
	    photos: {
    		others: []
    	},
    	menus: [],
    	links: {
    		other_links: []
    	},
    	business_hours: {
    		monday: {
    			closed: false,
    			timings: [{

    			}]
    		},
    		tuesday: {
    			closed: false,
    			timings: [{

    			}]
    		},
    		wednesday: {
    			closed: false,
    			timings: [{

    			}]
    		},
    		thursday: {
    			closed: false,
    			timings: [{

    			}]
    		},
    		friday: {
    			closed: false,
    			timings: [{

    			}]
    		},
    		saturday: {
    			closed: false,
    			timings: [{

    			}]
    		},
    		sunday: {
    			closed: false,
    			timings: [{

    			}]
    		}
    	}
    };

    $scope.isSpinnerVisible = false;
    $scope.marker = {
      id: 0,
      coords: {
        latitude: 28.6078341976,
        longitude: 77.2465642784
      },
      options: { draggable: true },
      events: {
        dragend: function (marker, eventName, args) {
          $log.log('marker dragend');
          var lat = marker.getPosition().lat();
          var lon = marker.getPosition().lng();
          $scope.outlet.contact.location.coords.longitude = lon;
          $scope.outlet.contact.location.coords.latitude = lat;
          $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + lat + ',' + lon + '&z=' + $scope.map.zoom;
          $log.log(lat);
          $log.log(lon);
          $log.log($scope.map.center.latitude, $scope.map.center.longitude);

          $scope.marker.options = {
            draggable: true,
            labelAnchor: "100 0",
            labelClass: "marker-labels"
          };
        }
      }
    };

    $scope.addNumber = function(field_name) {
    	if(!$scope.outlet.contact.phones[field_name]) {
    		$scope.outlet.contact.phones[field_name] = [];
    	}

    	$scope.outlet.contact.phones[field_name].push({
    		num: ''
    	});
    };

    $scope.addLandmark = function() {
        $scope.outlet.contact.location.landmarks.push('');
    }

    $scope.removeNumber = function(list, index) {
    	list.splice(index, 1);
    };

    $scope.removeLandmark = $scope.removeNumber;

    $scope.addImage = function() {
    	$scope.outlet.photos.others.push({
    		title: '',
    		image: ''
    	});
    };

    $scope.removeImage = function(index) {
    	$scope.outlet.photos.others.splice(index, 1);
    };

    $scope.addNewTiming = function(day, list) {
    	list[day].timings.push({});
    };

    $scope.removeTiming = function(day, index, list) {
    	list[day].timings.splice(index, 1);
    };

    $scope.updateTiming = function(day, list) {
    	if(list[day].closed) {
    		list[day].timings = [];
    	} else {
    		list[day].timings = [{}];
    	}
    };

    $scope.initalizeTiming = function(day, index, list) {
    	list[day].timings[index].open = {
    		hr: 0,
    		min: 0
    	};

    	list[day].timings[index].close = {
    		hr: 0,
    		min: 0
    	};
    	// var date = new Date(); 
    	// date.setHours(9); date.setMinutes(0); date.setSeconds(0); date.setMilliseconds(0);
    	// $scope.outlet.business_hours[day].timings[index].open = angular.copy(date);
    	// date.setHours(21); date.setMinutes(0); date.setSeconds(0); date.setMilliseconds(0);
    	// $scope.outlet.business_hours[day].timings[index].close = angular.copy(date);
    };

    $scope.cloneToAllDays = function(the_day, list) {
    	_.each(list, function(schedule, day) {
    		if(day !== the_day) {
    			schedule.timings = _.cloneDeep(list[the_day].timings);
                schedule.closed = list[the_day].closed;
    		}
    	});
    };

    $scope.outlet_icons = [{
    	type: 'bakery',
    	icon: 'bakery'
    }, {
    	type: 'bakery',
    	icon: 'cake'
    }, {
    	type: 'cafe',
    	icon: 'cafe'
    }, {
    	type: 'cafe',
    	icon: 'bistro'
    }, {
    	type: 'desserts',
    	icon: 'desserts'
    }, {
    	type: 'fast_food',
    	icon: 'fast_food'
    }, {
    	type: 'fast_food',
    	icon: 'burgers'
    }, {
    	type: 'fast_food',
    	icon: 'pizza'
    }, {
    	type: 'fast_food',
    	icon: 'wraps'
    }, {
    	type: 'pub',
    	icon: 'beer'
    }, {
    	type: 'pub',
    	icon: 'pub'
    }, {
    	type: 'restaurant',
    	icon: 'restaurant'
    }, {
    	type: 'restaurant',
    	icon: 'biryani'
    }, {
    	type: 'restaurant',
    	icon: 'chinese'
    }, {
    	type: 'restaurant',
    	icon: 'conntinental'
    },  {
    	type: 'restaurant',
    	icon: 'north_indian'
    }, {
    	type: 'takeaway',
    	icon: 'takeaway'
    }, {
    	type: 'other',
    	icon: 'other'
    }];

    $scope.updateIcon = function() {
    	if(!_.has($scope, ['outlet', 'basics', 'is_a']))
    		return;
		$scope.outlet.basics.icon = $scope.outlet.basics.is_a;
    };

    $scope.getErrorMessage = function(timing) {
    	var open_min = (timing.open.hr * 60) + timing.open.min,
    		close_min = (timing.close.hr * 60) + timing.close.min;

    	if((open_min + 60) < (close_min)) { // outlet must be open for atleast one hour
    		return "Duration must be atleast 1 hour long";
    	} else {
    		return "";
    	}
    };


    $scope.addMenu = function() {
        if(!$scope.outlet.menu || !$scope.outlet.menu.length) {
            $scope.outlet.menu = [];
        }
    	$scope.outlet.menu.push({
    		sections: []
    	});
    };

    $scope.addSection = function(index) {
    	$scope.outlet.menu[index].sections.push({
    		items: []
    	});
    };

    $scope.addItem = function(section) {
    	section.items.push({});
    };

    $scope.removeInstance = function(obj, index, path) {
    	obj[path].splice(index, 1);
    };

    $scope.addLink = function() {
    	$scope.outlet.links.other_links.push({});
    };

    $scope.removeLink = function(index) {
    	$scope.outlet.links.other_links.splice(index, 1);
    };

    $scope.$watchCollection('checkModel', function () {
        $scope.checkResults = [];
        $scope.outlet.attributes.payment_options = Object.keys(_.pick($scope.checkModel, function(val, key) { return val; }));
      });

    $scope.updateSMSOff = function() {
        if(!$scope.outlet.sms_off.value) {
            $scope.outlet.sms_off.time = {};
        } else {
            $scope.outlet.sms_off.time = {
                start: { hr: 23, min: 0 },
                end: { hr: 9, min: 0 }
            };
        }
    }

    $scope.finishedWizard = function() {
        $scope.validateBasics()
        .then(function() {
            $scope.validateContactInfo()
            .then(function() {
                $scope.validateLinks()
                .then(function() {
                    $scope.validateBusinessHours()
                    .then(function() {
                        $scope.validateAttributes()
                        .then(function() {
                            $scope.validateDeliveryInfo()
                            .then(function() {
                                $scope.validatePhotos()
                                .then(function() {
                                    $scope.saveOutlet()
                                    .then(function() {

                                    }, $scope.handleErrors);
                                }, $scope.handleErrors);
                            }, $scope.handleErrors);
                        }, $scope.handleErrors);
                    }, $scope.handleErrors);
                }, $scope.handleErrors);
            }, $scope.handleErrors);
        }, $scope.handleErrors);
        console.log($scope.outlet);
        console.log(myForm.$valid);
    };

    $scope.handleErrors = function(err) {
        $scope.formFailure = true;
        console.error('error', err);
    };

    $scope.validateStep1 = function() {
        if(!_.has($scope.outlet, 'basics.name')) {
            $scope.handleErrors('Outname name is mandatory');
            return false
        } else if(!_.has($scope.outlet, 'basics.main_type')) {
            $scope.handleErrors('Outlet main type is mandatory');
            return false
        } else if(!_.has($scope.outlet, 'basics.is_a')) {
            $scope.handleErrors('Outlet classification is mandatory');
            return false
        } else if(!_.has($scope.outlet, 'basics.icon')) {
            $scope.handleErrors('Outlet icon is mandatory');
            return false;
        } else if(!_.has($scope.outlet, 'attributes.air_conditioning') || !_.has($scope.outlet, 'attributes.parking') || !_.has($scope.outlet, 'attributes.reservation') || !_.has($scope.outlet, 'attributes.wifi') || !_.has($scope.outlet, 'attributes.cost_for_two.min') || !_.has($scope.outlet, 'attributes.cost_for_two.max') || !_.has($scope.outlet, 'attributes.timings') || !_.has($scope.outlet, 'attributes.cuisines.0') || !_.has($scope.outlet, 'attributes.payment_options.0') || !_.has($scope.outlet,'attributes.tags.0')) {
            $scope.handleErrors('Outlet attributes data is incomplete. Please complete to continue');
        } else if($scope.outlet.sms_off.value && ((($scope.outlet.sms_off.time.start.hr * 60) + $scope.outlet.sms_off.time.start.min) == (($scope.outlet.sms_off.time.end.hr * 60) + $scope.outlet.sms_off.time.end.min))) {
            $scope.handleErrors('Outlet SMS Off timings are invalid. Rectify to continue');
            return false;
        } else {
            return true;
        }
    };

    $scope.validateStep2 = function() {
        if(!_.has($scope.outlet, 'contact.location.coords.longitude') || !_.has($scope.outlet, 'contact.location.coords.latitude') || !_.has($scope.outlet, 'contact.location.map_url')) {
            $scope.handleErrors('Geo Location data missing');
            return false;
        } else if(!_.has($scope.outlet, 'contact.emails.person') || !_.has($scope.outlet, 'contact.emails.email') || !_.has($scope.outlet, 'contact.emails.type')) {
            $scope.handleErrors("Contact person\'s info is incomplete. Please rectify.");
            return false;
        } else if(!_.has($scope.outlet, 'contact.location.address') || !_.has($scope.outlet, 'contanct.location.locality_1.0') || !_.has($scope.outlet, 'contact.location.locality_2.0') || !_.has($scope.outlet, 'contact.location.city') || !_.has($scope.outlet, 'contanct.location.pin')) {
            $scope.handleErrors('Address information is incomplete. Please rectify to continue');
            return false;
        } else if(!_.has($scope.outlet, 'contact.location.landmarks.0')) {
            $scope.handleErrors('Atleast one landmark must be provided.');
            return false;
        } else if(!_.has($scope.outlet, 'contact.phones.mobile.0')) {
            $scope.handleErrors('Atleast one mobile number required');
            return false;
        } else if(!_.has($scope.outlet, 'contact.phones.reg_mobile.0')) {
            $scope.handleErrors('Atleast one registered mobile number required');
            return false;
        } else {
            return true;
        }
    };

    $scope.validateStep4 = function() {
        if(!_.has($scope.outlet, 'photos.logo')) {
            $scope.handleErrors('Logo is mandatory');
            return false;
        } else if(!_.has($scope.outlet, 'photos.logo_gray')) {
            $scope.handleErrors('Grayed out logo is mandatory');
            return false;
        } else if(!_.has($scope.outlet, 'photos.background')) {
            $scope.handleErrors('Background image is mandatory');
            return false;
        } else {
            return true;
        }
    };

    $scope.validateStep5 =function() {
        _.each($scope.outlet.business_hours, function(schedule, key) {
            if(!schedule.closed) {
                _.each(schedule.timings, function(timing) {
                    if(((timing.open.hr * 60) + timing.open.min + 60) > ((timing.close.hr * 60) + timing.close.min)) {
                        $scope.handleErrors("One or more timings are invalid. Please rectify to continue");
                        return false;
                    }
                });
            }
        });
        return true;
    };

    $scope.validateStep6 = function() {
        _.each($scope.outlet.menus, function(menu) {
            if(!_.has(menu, 'name') || !_.has(menu, 'menu_description')) {
                $scope.handleErrors('One or more menu data incomplete');
                return false;
            }
            _.each(menu.sections, function(section) {
                if(!_.has(section, 'section_name') || !_.has(section, 'section_description')) {
                    $scope.handleErrors('One or more section data incomplete');
                    return false;
                }
                ld.each(section.items, function(item) {
                    if(!_.has(item, 'item_name') || !_.has(item, 'item_description') || !_.has(item, 'item_photo') || !_.has(item, 'item_tags.0') || !_.has(item, 'item_cost')) {
                        $scope.handleErrors('One or more item data incomplete');
                        return false;
                    }
                });
            });
        });
        return true;
    };

    $scope.validateContactInfo = function() {
        if(!_.has($scope.outlet, 'contact.location.coords.longitude') || !_.has($scope.outlet, 'contact.location.coords.latitude') || !_.has($scope.outlet, 'contact.location.map_url')) {
            $scope.handleErrors('Geo Location data missing');
            return false;
        } else if(!_.has($scope.outlet, 'contact.location.address') || !_.has($scope.outlet, 'contanct.location.locality_1.0') || !_.has($scope.outlet, 'contact.location.locality_2.0') || !_.has($scope.outlet, 'contact.location.city') || !_.has($scope.outlet, 'contanct.location.pin')) {
            $scope.handleErrors('Address information is incomplete. Please rectify to continue');
            return false;
        } else if(!_.has($scope,outlet, '')) {
            $scope.handleErrors('');
            return false;
        }
    }

}]);
