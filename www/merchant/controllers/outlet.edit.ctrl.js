angular.module('merchantApp')
  .controller('OutletEditController', ['$scope', 'merchantRESTSvc', '$stateParams', '$log', '$http', '$rootScope', 'toastr', '$timeout', '$state', '$q', '$modal', 'imageSvc',
    function($scope, merchantRESTSvc, $stateParams, $log, $http, $rootScope, toastr, $timeout, $state, Q, $modal, imageSvc) {

      $scope.cuisines = ["African", "American", "Andhra", "Arabic", "Armenian", "Asian", "Assamese", "Awadhi", "Bangladeshi", "Belgian", "Bengali", "Biryani", "British", "Burmese", "Chettinad", "Chinese", "Continental", "Costal", "Desserts", "European", "Fast Food", "Finger Food", "French", "German", "Goan", "Greek", "Gujarati", "Healthy Food", "Hyderabadi", "Ice creams", "Indian", "Indonesian", "Italian", "Japanese", "Kashmiri", "Konkan", "Malayali", "Korean", "Lebanese", "Lucknowi", "Maharashtrian", "Malaysian", "Mangalorean", "Mediterranean", "Mexican", "Moroccan", "Mughlai", "Naga", "Nepalese", "North Eastern", "North Indian", "Oriya", "Pakistani", "Parsi", "Pizza", "Portuguese", "Punjabi", "Rajasthani", "Russian", "Sri Lankan", "Sindhi", "Singaporean", "South American", "South Indian", "Spanish", "Street Food", "Sushi", "Tex-Mex", "Thai", "Tibetan", "Turkish", "Vietnamese", "Wraps", "Bakery", "Beverages", "Burgers", "Cafe", "Salads", "Sandwiches", "Seafood", "Middle Eastern", "Steaks", "Sizzlers"];
      $scope.map = { center: { latitude: 28.805422897457665, longitude: 77.16647699812655 }, zoom: 14 };
      $scope.isPaying = $rootScope.isPaying;
      $scope.outlet_types = [{ value: 'bakery', name: 'Bakery' }, { value: 'cafe', name: 'Cafe' }, { value: 'delivery', name: 'Delivery Only' }, { value: 'desserts', name: 'Desserts' }, { value: 'pub_lounge', name: 'Pub/Lounge' }, { value: 'fast_food', name: 'QSR/Fast Food' }, { value: 'restaurant', name: 'Restaurant' }];

      $scope.outlet = {};
      _id = $stateParams.outletId;

      $scope.marker = { id: 0, coords: { latitude: 28.6078341976, longitude: 77.2465642784 }, options: { draggable: true }, events: { dragend: function(marker, eventName, args) { var lat = marker.getPosition().lat(); var lon = marker.getPosition().lng(); $scope.outlet.contact.location.coords.longitude = lon; $scope.outlet.contact.location.coords.latitude = lat; $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + lat + ',' + lon + '&z=' + $scope.map.zoom; $scope.marker.options = { draggable: true, labelAnchor: "100 0", labelClass: "marker-labels" }; } } };
      $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      $scope.mapEvents = { click: function(binding, event_type, click_obj) { var lat = click_obj[0].latLng.A; var lon = click_obj[0].latLng.F; $scope.$apply(function() { $scope.marker.coords = { latitude: lat, longitude: lon }; $scope.outlet.contact.location.coords = { latitude: lat, longitude: lon }; $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + lat + ',' + lon + '&z=' + $scope.map.zoom; }); } }

      $http.get('/api/v4/locations').then(function(res) {if(res.data.response) {$scope.locations = res.data.data;} else {$scope.locations = [];toastr.error("Error loading location info");}}, function(err) {console.log('error', err);});

      merchantRESTSvc.getOutlets().then(function(res) {angular.forEach(res.data.outlets, function(outlet) {if (outlet._id == $stateParams.outletId) {$scope.outlet = angular.copy(outlet); $scope.outlet.attributes.cost_for_two.min=$scope.outlet.attributes.cost_for_two.min.toString(); $scope.outlet.attributes.cost_for_two.max=$scope.outlet.attributes.cost_for_two.max.toString(); $scope.map.center = {latitude: $scope.outlet.contact.location.coords.latitude,longitude: $scope.outlet.contact.location.coords.longitude};$scope.marker.coords = {latitude: $scope.outlet.contact.location.coords.latitude,longitude: $scope.outlet.contact.location.coords.longitude};angular.forEach($scope.outlet.business_hours, function(schedule) {angular.forEach(schedule.timings, function(timing) {var _time = new Date();_time.setHours(timing.open.hr);_time.setMinutes(timing.open.min);_time.setSeconds(0);_time.setMilliseconds(0);timing.open.time = _.clone(_time);_time.setHours(timing.close.hr);_time.setMinutes(timing.close.min);timing.close.time = _.clone(_time);});});}});}, function(err) {$log.log('err', err);});

      $scope.options = { scrollwheel: true };

      $scope.updateMapMarker = function(latitude, longitude) {
        if ($scope.outlet.contact.location.coords.latitude !== latitude || !$scope.outlet.contact.location.coords.longitude !== longitude) {
          $scope.outlet.contact.location.coords = { latitude: latitude, longitude: longitude };
        }

        $scope.map.center = { latitude: latitude, longitude: longitude };
        $scope.marker.coords = { latitude: latitude, longitude: longitude };
        $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + latitude + ',' + longitude + '&z=' + $scope.map.zoom;
      }

      $scope.scrollToTop = function() {
          $('document').ready(function() {
              $(window).scrollTop(0);
          });
      }

      $scope.addNumber = function(field_name) {
        if (!$scope.outlet.contact.phones[field_name]) {
          $scope.outlet.contact.phones[field_name] = [];
        }
        var num = { num: '', num_type: '' };

        $scope.outlet.contact.phones[field_name].push(num);
      };

      $scope.addLandmark = function() {
        $scope.outlet.contact.location.landmarks.push('');
      }

      $scope.removeNumber = function(list, index) {
        list.splice(index, 1);
      };

      $scope.removeLandmark = $scope.removeNumber;

      $scope.addImage = function() {
        $scope.outlet.photos.others.push({ title: '', image: '' });
      };

      $scope.removeImage = function(index) {
        $scope.outlet.photos.others.splice(index, 1);
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

      $scope.updateTiming = function(day, list) {
        if (list[day].closed) {
          list[day].timings = [];
        } else {
          list[day].timings = [{}];
        }
      };

      $scope.updateTime = function(day, index, list) {
        var _timing = list[day].timings[index];
        if (_timing.open.time) {
          _timing.open.hr = _timing.open.time.getHours(); _timing.open.min = _timing.open.time.getMinutes();
        }
        if (_timing.close.time) {
          _timing.close.hr = _timing.close.time.getHours(); _timing.close.min = _timing.close.time.getMinutes();
        }
      }

      $scope.initalizeTiming = function(day, index, list) {
        if (list[day].timings[index].open && list[day].timings[index].close) {
          return;
        }
        var openTime = new Date();
        if($rootScope.isPaying) {
          openTime.setHours(9); openTime.setMinutes(0); openTime.setSeconds(0); openTime.setMilliseconds(0);
        } else {
          openTime.setHours(0); openTime.setMinutes(1); openTime.setSeconds(0); openTime.setMilliseconds(0);
        }
        var closeTime = new Date();
        if($rootScope.isPaying) {
          closeTime.setHours(21); closeTime.setMinutes(0); closeTime.setSeconds(0); closeTime.setMilliseconds(0);
        } else {
          closeTime.setHours(0); closeTime.setMinutes(0); closeTime.setSeconds(0); closeTime.setMilliseconds(0);
        }
        if($rootScope.isPaying) {
          list[day].timings[index] = { open: { hr: 9, min: 0, time: openTime}, close: { hr: 21, min: 0, time: closeTime} };
        } else {
          list[day].timings[index] = { open: { hr: 0, min: 1, time: openTime}, close: { hr: 0, min: 0, time: closeTime } };
        }
      };

      $scope.cloneToAllDays = function(the_day, list) {
        _.each(list, function(schedule, day) {
          if (day !== the_day) {
            schedule.timings = _.cloneDeep(list[the_day].timings); schedule.closed = list[the_day].closed;
          }
        });
      };

      $scope.outlet_icons = [{ type: 'bakery', icon: 'bakery' }, { type: 'bakery', icon: 'cake' }, { type: 'cafe', icon: 'cafe' }, { type: 'cafe', icon: 'bistro' }, { type: 'desserts', icon: 'desserts' }, { type: 'fast_food', icon: 'fast_food' }, { type: 'fast_food', icon: 'burgers' }, { type: 'fast_food', icon: 'pizza' }, { type: 'fast_food', icon: 'wraps' }, { type: 'pub', icon: 'beer' }, { type: 'pub', icon: 'pub' }, { type: 'restaurant', icon: 'restaurant' }, { type: 'restaurant', icon: 'biryani' }, { type: 'restaurant', icon: 'chinese' }, { type: 'restaurant', icon: 'conntinental' }, { type: 'restaurant', icon: 'north_indian' }, { type: 'takeaway', icon: 'takeaway' }, { type: 'other', icon: 'other' }];

      $scope.updateIcon = function() {
        if (!_.has($scope, ['outlet', 'basics', 'is_a']))
          return;
        $scope.outlet.basics.icon = $scope.outlet.basics.is_a;
      };

      $scope.getErrorMessage = function(timing) {
        var open_min = (timing.open.hr * 60) + timing.open.min,
          close_min = (timing.close.hr * 60) + timing.close.min;

        if ((open_min + 60) < (close_min)) { // outlet must be open for atleast one hour
          return "Duration must be atleast 1 hour long";
        } else {
          return "";
        }
      };


      $scope.addMenu = function() {
        if (!$scope.outlet.menu || !$scope.outlet.menu.length) {
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

      $scope.updateSMSOff = function() {
        if (!$scope.outlet.sms_off.value) {
          $scope.outlet.sms_off.time = {};
        } else {
          $scope.outlet.sms_off.time = { start: { hr: 23, min: 0 }, end: { hr: 9, min: 0 } };
        }
      }

      $scope.updateOutlet = function() {
        $http.put('/api/v4/outlets/' + $stateParams.outletId + '?token=' + $rootScope.token, $scope.outlet)
          .success(function(data) {
            if (data.response) {
              toastr.success('Outlet updated successfully');
              $scope.outlet = {};
              _id = undefined;
              $timeout(function() {
                $state.go('merchant.outlets');
              }, 800);
            } else {
              toastr.error(data.message, "Error");
            }
          })
          .error(function(err) {
            if (err.message) {
              toastr.error(err.message, "Error");
            }
            console.log('err', err);
          });
      };

      $scope.handleErrors = function(err) {
        $scope.formFailure = true;
        toastr.error(err, 'Error');
      };

      $scope.validateStep1 = function() {
        var deferred = Q.defer();
        if (!_.has($scope.outlet, 'basics.name') || !$scope.outlet.basics.name) {
          $scope.handleErrors('Outlet name is mandatory');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.address') || !$scope.outlet.contact.location.address) {
          $scope.handleErrors('Complete outlet address is mandatory');
          deferred.reject();
        } else if (!$scope.outlet.contact.location.locality_2[0]) {
          $scope.handleErrors('Locality 2 must be specified');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.city') || !$scope.outlet.contact.location.city) {
          $scope.handleErrors('Please provide a city name');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.coords.longitude') || !$scope.outlet.contact.location.coords.longitude || !_.has($scope.outlet, 'contact.location.coords.latitude') || !$scope.outlet.contact.location.coords.latitude || !_.has($scope.outlet, 'contact.location.map_url') || !$scope.outlet.contact.location.map_url) {
          $scope.handleErrors('Geo Location data missing');
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
              $scope.handleErrors(err);
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
                  $scope.handleErrors(err);
                  deferred.reject();
                } else {
                  if (!_.has($scope.outlet, 'contact.emails.person') || !$scope.outlet.contact.emails.person && $rootScope.isPaying) {
                    $scope.handleErrors("Contact person's name required");
                    deferred.reject();
                  } else if (!_.has($scope.outlet, 'contact.emails.email') || !$scope.outlet.contact.emails.email && $rootScope.isPaying) {
                    $scope.handleErrors("Contact person's Email ID required");
                    deferred.reject();
                  } else {
                    $scope.scrollToTop();
                    $scope.formFailure = false;
                    deferred.resolve(true);
                  }
                }
              });
            }
          });
        }
        return deferred.promise;
      };

      $scope.validateStep2 = function() {
        var deferred = Q.defer();
        if (!_.has($scope.outlet, 'basics.main_type') || !$scope.outlet.basics.main_type && $rootScope.isPaying) {
          $scope.handleErrors("Outlet type required");
          deferred.reject();
        } else if ((!$scope.outlet.attributes.cost_for_two.min || !$scope.outlet.attributes.cost_for_two.max) && $rootScope.isPaying) {
          $scope.handleErrors("Valid cost for two range required");
          deferred.reject();
        } else if (parseInt($scope.outlet.attributes.cost_for_two.min) >= parseInt($scope.outlet.attributes.cost_for_two.max)) {
          $scope.handleErrors("Cost for two minimum value should be lesser than maximum value");
          deferred.reject();
        } else if ($scope.outlet.attributes.home_delivery && $rootScope.isPaying && (!_.has($scope.outlet, 'attributes.delivery.delivery_estimated_time') || !/^[0-9]{1,3}$/i.test($scope.outlet.attributes.delivery.delivery_estimated_time))) {
          $scope.handleErrors("Valid estimate delivery time required");
          deferred.reject();
        } else if (!$scope.outlet.attributes.dine_in && !$scope.outlet.attributes.home_delivery && $rootScope.isPaying) {
          $scope.handleErrors("Outlet must have atleast dine-in or delivery available");
          deferred.reject();
        } else if ((!$scope.outlet.attributes.cuisines || !$scope.outlet.attributes.cuisines.length) && $rootScope.isPaying) {
          $scope.handleErrors("Atleast one cuisine must be specified");
          deferred.reject();
        } else if ($scope.outlet && $scope.outlet.sms_off && $scope.outlet.sms_off.value) {
          if ((!$scope.outlet.sms_off.time.start.hr && $scope.outlet.sms_off.time.start.hr !== 0) || (!$scope.outlet.sms_off.time.start.min && $scope.outlet.sms_off.time.start.min !== 0)) {
            $scope.handleErrors("SMS OFF start time invalid");
            deferred.reject();
          } else if ((!$scope.outlet.sms_off.time.end.hr && $scope.outlet.sms_off.time.end.hr !== 0) || (!$scope.outlet.sms_off.time.end.min && $scope.outlet.sms_off.time.end.min !== 0)) {
            $scope.handleErrors("SMS OFF end time invalid");
            deferred.reject();
          } else {
            var startMin = ($scope.outlet.sms_off.time.start.hr * 60) + $scope.outlet.sms_off.time.start.min,
              closeMin = ($scope.outlet.sms_off.time.end.hr * 60) + $scope.outlet.sms_off.time.end.min;
            if (startMin == closeMin) {
              $scope.handleErrors("SMS Off start and end time cannot be the same");
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
        return deferred.promise;
      };

      $scope.validateStep3 = function() {
        var deferred = Q.defer();
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
            $scope.handleErrors(err);
            deferred.reject();
          } else {
            $scope.scrollToTop();
            $scope.formFailure = false;
            deferred.resolve(true);
          }
        });
        return deferred.promise;
      }

      $scope.validateStep4 = function() {
        var deferred = Q.defer();
        if ((!_.has($scope.outlet, 'photos.logo') || !$scope.outlet.photos.logo) && $scope.isPaying) {
          $scope.handleErrors('Logo is mandatory');
          deferred.reject();
        } else if ((!_.has($scope.outlet, 'photos.background') || !$scope.outlet.photos.background) && $scope.isPaying) {
          $scope.handleErrors('Background image is mandatory');
          deferred.reject();
        } else {
          async.each($scope.outlet.photos.others, function(otherImg, callback) {
            if (!otherImg.title) {
              callback("Title for one/more of the additional photos is missing");
            } else if (!otherImg.image) {
              callback("Image for one/more of the additional photos is missing");
            } else {
              callback();
            }
          }, function(err) {
            if (err) {
              $scope.handleErrors(err);
              deferred.reject();
            } else {
              $scope.scrollToTop();
              $scope.formFailure = false;
              deferred.resolve(true);
            }
          })
        }
        return deferred.promise;
      };

      $scope.addCuisine = function(newCuisine) {
        if (!newCuisine)
          return;

        if (!$scope.outlet.attributes.cuisines) {
          $scope.outlet.attributes.cuisines = [];
        }
        if ($scope.outlet.attributes.cuisines.indexOf(newCuisine) == -1) {
          $scope.outlet.attributes.cuisines.push(newCuisine);
        }
      }

      $scope.removeCuisine = function(index) {
        $scope.outlet.attributes.cuisines.splice(index, 1);
      }

      $scope.chooseImage = function() {
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'templates/partials/background_picker.html',
          size: 'lg',
          controller: 'ImagePickerController'
        });

        modalInstance.result.then(function (selectedItem) {
          var img_obj = {};
          img_obj['source'] = selectedItem;
          img_obj['image_type'] = 'background';
          if(_id) {
            img_obj['id'] = _id
          }
          imageSvc.cloneImage(img_obj).then(function(data) {
            $scope.outlet.photos.background = 'asd';
            $scope.outlet.photos.background = data.key;
            toastr.success('Image set successfully');
          }, function(err) {
            console.log(err);
          })
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      }

    }
  ]).controller('ImagePickerController', function($scope, $modalInstance) {
    $scope.images = {
      'north-indian': [
        'retwyst-merchants/default-images/north-indian/1', 'retwyst-merchants/default-images/north-indian/2',
        'retwyst-merchants/default-images/north-indian/3', 'retwyst-merchants/default-images/north-indian/4',
        'retwyst-merchants/default-images/north-indian/5', 'retwyst-merchants/default-images/north-indian/6',
        'retwyst-merchants/default-images/north-indian/7', 'retwyst-merchants/default-images/north-indian/8',
        'retwyst-merchants/default-images/north-indian/9', 'retwyst-merchants/default-images/north-indian/10',
        'retwyst-merchants/default-images/north-indian/11', 'retwyst-merchants/default-images/north-indian/12',
        'retwyst-merchants/default-images/north-indian/13', 'retwyst-merchants/default-images/north-indian/14',
        'retwyst-merchants/default-images/north-indian/15', 'retwyst-merchants/default-images/north-indian/16',
        'retwyst-merchants/default-images/north-indian/17', 'retwyst-merchants/default-images/north-indian/18',
        'retwyst-merchants/default-images/north-indian/19', 'retwyst-merchants/default-images/north-indian/20'
      ],
      'pizza': [
        'retwyst-merchants/default-images/pizza/1', 'retwyst-merchants/default-images/pizza/2'
      ],
      'wrap': [
        'retwyst-merchants/default-images/wrap/1', 'retwyst-merchants/default-images/wrap/2',
        'retwyst-merchants/default-images/wrap/3'
      ],
      'sandwich': [
        'retwyst-merchants/default-images/sandwich/1', 'retwyst-merchants/default-images/sandwich/2',
        'retwyst-merchants/default-images/sandwich/3'
      ],
      'burger': [
        'retwyst-merchants/default-images/burger/1', 'retwyst-merchants/default-images/burger/2',
        'retwyst-merchants/default-images/burger/3', 'retwyst-merchants/default-images/burger/4'
      ],
      'beverages': [
        'retwyst-merchants/default-images/beverages/1', 'retwyst-merchants/default-images/beverages/2',
        'retwyst-merchants/default-images/beverages/3', 'retwyst-merchants/default-images/beverages/4',
        'retwyst-merchants/default-images/beverages/5', 'retwyst-merchants/default-images/beverages/6',
        'retwyst-merchants/default-images/beverages/7', 'retwyst-merchants/default-images/beverages/8',
        'retwyst-merchants/default-images/beverages/9', 'retwyst-merchants/default-images/beverages/10'
      ],
      'desserts': [
        'retwyst-merchants/default-images/desserts/1', 'retwyst-merchants/default-images/desserts/2',
        'retwyst-merchants/default-images/desserts/3', 'retwyst-merchants/default-images/desserts/4',
        'retwyst-merchants/default-images/desserts/5', 'retwyst-merchants/default-images/desserts/6',
        'retwyst-merchants/default-images/desserts/7', 'retwyst-merchants/default-images/desserts/8',
        'retwyst-merchants/default-images/desserts/9', 'retwyst-merchants/default-images/desserts/10',
        'retwyst-merchants/default-images/desserts/11', 'retwyst-merchants/default-images/desserts/12',
        'retwyst-merchants/default-images/desserts/13', 'retwyst-merchants/default-images/desserts/14'
      ],
      'chinese': [
        'retwyst-merchants/default-images/chinese/1', 'retwyst-merchants/default-images/chinese/2',
        'retwyst-merchants/default-images/chinese/3', 'retwyst-merchants/default-images/chinese/4',
        'retwyst-merchants/default-images/chinese/5', 'retwyst-merchants/default-images/chinese/6',
        'retwyst-merchants/default-images/chinese/7', 'retwyst-merchants/default-images/chinese/8',
        'retwyst-merchants/default-images/chinese/9', 'retwyst-merchants/default-images/chinese/10',
        'retwyst-merchants/default-images/chinese/11', 'retwyst-merchants/default-images/chinese/12'
      ],
      'healthy-food': [
        'retwyst-merchants/default-images/healthy-food/1', 'retwyst-merchants/default-images/healthy-food/2',
        'retwyst-merchants/default-images/healthy-food/3', 'retwyst-merchants/default-images/healthy-food/4',
        'retwyst-merchants/default-images/healthy-food/5'
      ],
      'south-indian': [
        'retwyst-merchants/default-images/south-indian/1', 'retwyst-merchants/default-images/south-indian/2'
      ],
      'biryani': [
        'retwyst-merchants/default-images/biryani/1', 'retwyst-merchants/default-images/biryani/2',
        'retwyst-merchants/default-images/biryani/3', 'retwyst-merchants/default-images/biryani/4',
        'retwyst-merchants/default-images/biryani/5', 'retwyst-merchants/default-images/biryani/6',
        'retwyst-merchants/default-images/biryani/7', 'retwyst-merchants/default-images/biryani/8',
        'retwyst-merchants/default-images/biryani/9', 'retwyst-merchants/default-images/biryani/10'
      ]
    }

    $scope.image_types = {
      'north-indian': 'North Indian', 
      'pizza': 'Pizza', 
      'wrap': 'Wraps', 
      'sandwich': 'Sandwiches', 
      'burger': 'Burgers', 
      'beverages': 'Beverages',
      'desserts': 'Desserts', 
      'chinese': 'Chinese', 
      'healthy-food': 'Healthy Food', 
      'south-indian': 'South Indian', 
      'biryani': 'Biryani'
    }

    $scope.chooseImage = function(image) {
      $modalInstance.close(image);
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  })