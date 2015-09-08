angular.module('merchantApp')
  .controller('OutletEditController', ['$scope', 'merchantRESTSvc', '$stateParams', '$log', '$http', '$rootScope', 'toastr', '$timeout', '$state', '$q',
    function($scope, merchantRESTSvc, $stateParams, $log, $http, $rootScope, toastr, $timeout, $state, Q) {

      $scope.cuisines = ["African", "American", "Andhra", "Arabic", "Armenian", "Asian", "Assamese", "Awadhi", "Bangladeshi", "Belgian", "Bengali", "Biryani", "British", "Burmese", "Chettinad", "Chinese", "Continental", "Desserts", "European", "Fast Food", "Finger Food", "French", "German", "Goan", "Greek", "Gujarati", "Healthy Food", "Hyderabadi", "Ice creams", "Indian", "Indonesian", "Italian", "Japanese", "Kashmiri", "Malayali", "Korean", "Lebanese", "Lucknowi", "Maharashtrian", "Malaysian", "Mangalorean", "Mediterranean", "Mexican", "Moroccan", "Mughlai", "Naga", "Nepalese", "North Eastern", "North Indian", "Oriya", "Pakistani", "Parsi", "Pizza", "Portuguese", "Punjabi", "Rajasthani", "Russian", "Sri Lankan", "Sindhi", "Singaporean", "South American", "South Indian", "Spanish", "Street Food", "Sushi", "Tex-Mex", "Thai", "Tibetan", "Turkish", "Vietnamese", "Wraps", "Bakery", "Beverages", "Burgers", "Cafe", "Salads", "Sandwiches", "Seafood", "Middle Eastern", "Steaks", "Sizzlers"];
      $scope.outlet = {};

      $scope.map = {
        center: {
          latitude: 28.805422897457665,
          longitude: 77.16647699812655
        },
        zoom: 10
      };
      $scope.options = {
        scrollwheel: true
      };

      merchantRESTSvc.retrieveOutlet($stateParams.outletId)
        .then(function(res) {
          if (res.response) {
            $scope.outlet = angular.copy(res.data);
            angular.forEach($scope.outlet.business_hours, function(schedule) {
              angular.forEach(schedule.timings, function(timing) {
                var _time = new Date();
                _time.setHours(timing.open.hr);
                _time.setMinutes(timing.open.min);
                _time.setSeconds(0);
                _time.setMilliseconds(0);
                timing.open.time = _time;
                _time.setHours(timing.close.hr);
                _time.setMinutes(timing.close.min);
                timing.close.time = _time;
              })
            });
          } else {
            $log.log('err', err);
          }
        }, function(err) {
          $log.log('err', err);
        });

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
            var lat = marker.getPosition().lat();
            var lon = marker.getPosition().lng();
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

      $scope.mapEvents = {
        click: function(binding, event_type, click_obj) {
          var lat = click_obj[0].latLng.A;
          var lon = click_obj[0].latLng.F;
          $scope.$apply(function() {
            $scope.marker.coords = {
              latitude: lat,
              longitude: lon
            };
            $scope.outlet.contact.location.coords = {
              latitude: lat,
              longitude: lon
            };
            $scope.outlet.contact.location.map_url = 'https://maps.google.com/maps/?q=' + lat + ',' + lon + '&z=' + $scope.map.zoom;
            $scope.marker.options = {
              draggable: true,
              labelAnchor: "100 0",
              labelClass: "marker-labels"
            };
          });
        }
      }

      $scope.addNumber = function(field_name) {
        if (!$scope.outlet.contact.phones[field_name]) {
          $scope.outlet.contact.phones[field_name] = [];
        }
        var num = {
          num: ''
        };

        if (field_name == 'mobile') {
          num.num_type = 'mobile'
        };

        $scope.outlet.contact.phones[field_name].push(num);
      };

      $scope.removeNumber = function(list, index) {
        list.splice(index, 1);
      };

      $scope.addImage = function() {
        $scope.outlet.photos.others.push({
          title: '',
          image: ''
        });
      };

      $scope.removeImage = function(index) {
        $scope.outlet.photos.others.splice(index, 1);
      };

      $scope.getMaxRange = function() {
        if (!$scope.outlet.business_hours)
          return;
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
          _timing.open.hr = _timing.open.time.getHours();
          _timing.open.min = _timing.open.time.getMinutes();
        }
        if (_timing.close.time) {
          _timing.close.hr = _timing.close.time.getHours();
          _timing.close.min = _timing.close.time.getMinutes();
        }
      }

      $scope.initalizeTiming = function(day, index, list) {
        if (list[day].timings[index].open && list[day].timings[index].close || list[day]) {
          return;
        }
        var openTime = new Date();
        openTime.setHours(9);
        openTime.setMinutes(0);
        openTime.setSeconds(0);
        openTime.setMilliseconds(0);
        var closeTime = new Date();
        closeTime.setHours(21);
        closeTime.setMinutes(0);
        closeTime.setSeconds(0);
        closeTime.setMilliseconds(0);
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
          },
        }
      };

      $scope.cloneToAllDays = function(the_day, list) {
        _.each(list, function(schedule, day) {
          if (day !== the_day) {
            schedule.timings = _.cloneDeep(list[the_day].timings);
            schedule.closed = list[the_day].closed;
          }
        });
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
      }

      $scope.handleErrors = function(err) {
        $scope.formFailure = true;
        toastr.error(err, 'Error');
      };

      $scope.validateStep1 = function() {
        var deferred = Q.defer();
        if (!_.has($scope.outlet, 'basics.name')) {
          $scope.handleErrors('Outname name is mandatory');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.address')) {
          $scope.handleErrors('Complete outlet address is mandatory');
          deferred.reject();
        } else if (!$scope.outlet.contact.location.locality_2[0]) {
          $scope.handleErrors('Locality 2 must be specified');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.city')) {
          $scope.handleErrors('Please provide a city name');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.pin')) {
          $scope.handleErrors('Please provide a pincode');
          deferred.reject();
        } else if (!/^[0-9]{6}$/.test($scope.outlet.contact.location.pin)) {
          $scope.handleErrors("Invalid pincode provided");
          deferred.reject();
        } else if (!_.has($scope.outlet, 'contact.location.coords.longitude') || !_.has($scope.outlet, 'contact.location.coords.latitude') || !_.has($scope.outlet, 'contact.location.map_url')) {
          $scope.handleErrors('Geo Location data missing');
          deferred.reject();
        } else {
          async.each($scope.outlet.contact.phones.mobile, function(number, callback) {
            if (!number.num) {
              callback("One or more outlet numbers left blank");
            } else if (!/^[0-9]{10}$/.test(number.num)) {
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
                } else if (!/^[0-9]{10}$/.test(number.num)) {
                  callback("One or more registered mobile numbers are invalid");
                } else {
                  callback();
                }
              }, function(err) {
                if (err) {
                  $scope.handleErrors(err);
                  deferred.reject();
                } else {
                  if (!_.has($scope.outlet, 'contact.emails.person') || !$scope.outlet.contact.emails.person) {
                    $scope.handleErrors("Contact person's name required");
                    deferred.reject();
                  } else if (!_.has($scope.outlet, 'contact.emails.designation') || !$scope.outlet.contact.emails.designation) {
                    $scope.handleErrors("Contact person's designation required");
                    deferred.reject();
                  } else if (!_.has($scope.outlet, 'contact.emails.email') || !$scope.outlet.contact.emails.email) {
                    $scope.handleErrors("Contact person's Email ID required");
                    deferred.reject();
                  } else {
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
        if (!_.has($scope.outlet, 'basics.main_type')) {
          $scope.handleErrors("Outlet type required");
          deferred.reject();
        } else if ($scope.outlet.attributes.home_delivery && !_.has($scope.outlet, 'attributes.delivery.delivery_estimated_time')) {
          $scope.handleErrors("Estimate delivery time required");
          deferred.reject();
        } else if (!$scope.outlet.attributes.cuisines || !$scope.outlet.attributes.cuisines.length) {
          $scope.handleErrors("Atleast one cuisine must be specified");
          deferred.reject();
        } else if ($scope.outlet.sms_off.value) {
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
              deferred.resolve(true);
            }
          }
        } else {
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
                    } else if ((startMin1 <= closeMin2 <= closeMin1) || (startMin1 <= closeMin2 <= closeMin1) || (startMin2 <= closeMin1 <= closeMin2)) {
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
            deferred.resolve(true);
          }
        });
        return deferred.promise;
      }

      $scope.validateStep4 = function() {
        var deferred = Q.defer();
        if (!_.has($scope.outlet, 'photos.logo')) {
          $scope.handleErrors('Logo is mandatory');
          deferred.reject();
        } else if (!_.has($scope.outlet, 'photos.background')) {
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
              deferred.resolve(true);
            }
          })
        }
        return deferred.promise;
      };

      $scope.addCuisine = function(newCuisine) {
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
    }
  ])