angular.module('merchantApp')
  .controller('OutletViewController', ['$scope', 'merchantRESTSvc', '$stateParams', '$log',
    function($scope, merchantRESTSvc, $stateParams, $log) {

      $scope.attribute_set = [{ class_name: 'home_delivery', text: 'Home Delivery?' }, { class_name: 'dine_in', text: 'Dine-in Available?' }, { class_name: 'veg', text: 'Pure Vegitarian?' }, { class_name: 'alcohol', text: 'Serves alcohol' }, { class_name: 'outdoor', text: 'Outdoor sitting' }, { class_name: 'foodcourt', text: 'Inside a food court' }, { class_name: 'smoking', text: 'Smoking allowed?' }, { class_name: 'chain', text: 'Part of a chain?' }];

      $scope.acStatus = {
        "available": "Available",
        "not_available": "Unavailable",
        "partial": 'Partially',
        "unknown": 'Not Known'
      };
      $scope.parkingStatus = {
        "available": "Available",
        "not_available": "Unavailable",
        "valet": 'Valet Available',
        "unknown": 'Not Known'
      };
      $scope.reservationStatus = {
        "suggested": "Suggested",
        "not_required": 'Not Required',
        "unknown": 'Not Known'
      };
      $scope.wifiStatus = {
        "not_available": "Unavailable",
        "free": "Free Access",
        "paid": 'Paid Access',
        "unknown": 'Not Known'
      };

      $scope.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      $scope.marker = { id: 0, coords: { latitude: 28.6078341976, longitude: 77.2465642784 } };

      $scope.map = { center: { latitude: 28.805422897457665, longitude: 77.16647699812655 }, zoom: 14 };

      merchantRESTSvc.getOutlets().then(function(res) { angular.forEach(res.data.outlets, function(outlet) { if (outlet._id == $stateParams.outletId) { $scope.outlet = angular.copy(outlet); $scope.outlet.attributes.cost_for_two.min = $scope.outlet.attributes.cost_for_two.min.toString(); $scope.outlet.attributes.cost_for_two.max = $scope.outlet.attributes.cost_for_two.max.toString(); $scope.map.center = { latitude: $scope.outlet.contact.location.coords.latitude, longitude: $scope.outlet.contact.location.coords.longitude }; $scope.marker.coords = { latitude: $scope.outlet.contact.location.coords.latitude, longitude: $scope.outlet.contact.location.coords.longitude }; angular.forEach($scope.outlet.business_hours, function(schedule) { angular.forEach(schedule.timings, function(timing) { var _time = new Date(); _time.setHours(timing.open.hr); _time.setMinutes(timing.open.min); _time.setSeconds(0); _time.setMilliseconds(0); timing.open.time = _.clone(_time); _time.setHours(timing.close.hr); _time.setMinutes(timing.close.min); timing.close.time = _.clone(_time); }); }); } }); }, function(err) { $log.log('err', err); });
    }
  ])