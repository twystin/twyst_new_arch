twystMerchant.controller('ConsoleCtrl', function($scope, $timeout, $log, $mdToast, $rootScope, $state, $mdDialog, Restangular, $cookies, resUser, authenticated) {
  // Template for the outlet
  $timeout(function() {
    console.log(resUser);
    $scope.user = (resUser && resUser.data && resUser.data.data) || null;
    $scope.username = ($scope.user && $scope.user.email) || " ";
  });

  // Function to show toasts
  function showToast(message) {
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

    $mdToast.show(
      $mdToast.simple()
      .content(message)
      .position($scope.getToastPosition())
      .hideDelay(3000)
    );
  }

  if (!authenticated) {
    showToast("Please sign-in to continue!");
    $state.go('home');
  } else {
    showToast('Logged in successfully!');
  }

  $scope.main_type = ['fnb', 'spa', 'retail', 'other'];
  $scope.outlet = {
      basics : {
          name: null,
          main_type: null,
      },
      contact: {
          location: {
              address: null,
              locality_1: [],
              locality_2: [],
              city : null,
              pin : null
          },
          phones: {
              mobile: []
          }
      }
  };

  $scope.action = {
    rewards: {},
    points: 0
  };


  var baseOutlets = Restangular.all('outlets');

  $scope.save = function() {
    baseOutlets.post($scope.outlet).then(function(success) {
      console.log(success);
    }, function(err){
      console.log(err);
    });
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
