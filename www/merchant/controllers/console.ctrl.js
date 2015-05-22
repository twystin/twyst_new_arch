twystMerchant.controller('ConsoleCtrl', function($scope, $log, $mdToast, $rootScope, $state, $mdDialog, Restangular, $cookies) {
  // Template for the outlet
  $scope.is_a = ['desserts', 'restaurant','biryani','chinese','conntinental','north_indian','fast_food','burgers','pizza','wraps','pub','beer','bakery','cake','cafe','bistro','takeaway','other'];
  $scope.outlet = {
      publicUrl: null,
      basics : {
          name: null,
          is_a: null,
          icon: null
      },
      contact: {
          location: {
              coords: {
                  longitude: null,
                  latitude: null
              },
              address: null,
              landmarks: [],
              locality_1: [],
              locality_2: [],
              city : null,
              pin : null
          },
          phones: {
              mobile: [],
              reg_mobile: [],
          }
      },
      links: {
          website_url: null,
          facebook_url: null,
          twitter_url: null,
          youtube_url: null,
          zomato_url: null,
          foodpanda_url: null
      },
      business_hours: {},
      attributes: {
          delivery: {
            delivery_area: null,
            delivery_estimated_time: null,
            delivery_timings: {},
            delivery_conditions: null
          },
          home_delivery: false,
          dine_in: false,
          veg: false,
          alcohol: false,
          outdoor: false,
          foodcourt: false,
          smoking: false,
          chain: false,
          air_conditioning: null,
          parking: null,
          reservation: null,
          wifi: null,
          cost_for_two: {
              min: 0,
              max: 0
          },
          cuisines: [],
          payment_options: [],
          tags: []
      },
      photos: {
          logo: null,
          logo_gray: null,
          background: null,
          others:[]
      },
      offers: [],
      jobs: [],
      menu: []
  };

  $scope.action = {
    rewards: {},
    points: 0
  };

  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };
  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) {
        return $scope.toastPosition[pos];
      })
      .join(' ');
  };

  $scope.username = "Foofoo";
  $mdToast.show(
    $mdToast.simple()
    .content('Logged in successfully!')
    .position($scope.getToastPosition())
    .hideDelay(3000)
  );

  var baseOutlets = Restangular.all('outlets');

  $scope.save = function() {
    baseOutlets.post($scope.outlet);
    console.log($cookies.token);
    console.log("SAVED CALLED");
  };

  // For the tags
  var self = this;
  self.readonly = false;
  self.tags = [];

  // For the menu
  $scope.items = [];
  $scope.addItem = function() {
    $scope.items.push({});
  };

  var sections = [],
          selected = null,
          previous = null;
      $scope.sections = sections;
      $scope.selectedIndex = 2;
      $scope.$watch('selectedIndex', function(current, old){
        previous = selected;
        selected = sections[current];
        if ( old && (old != current)) $log.debug('Goodbye ' + previous.title + '!');
        if ( current )                $log.debug('Hello ' + selected.title + '!');
      });
      $scope.addTab = function (title, view) {
        view = view || title + " Content View";
        sections.push({ title: title, content: view, disabled: false});
      };
      $scope.removeTab = function (tab) {
        var index = sections.indexOf(tab);
        sections.splice(index, 1);
      };

});
