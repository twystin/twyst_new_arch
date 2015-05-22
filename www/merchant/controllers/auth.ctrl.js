twystMerchant.controller('AuthCtrl', function($scope, $rootScope, $state, $mdDialog, Restangular, $cookies) {
  // Initialize the variables for signin, register & forgot.
  $scope.loginuser = {};
  $scope.registeruser = {};
  $scope.resetpassworduser = {};

  // Helper method to bring up the forgot password dialog.
  $scope.forgotPassword = function(ev) {
    $mdDialog.show({
        controller: ForgotDialogCtrl,
        templateUrl: 'partials/home/forgot_password.tmpl.html',
        targetEvent: ev,
      });
  };

  // Method to sign the user in.
  $scope.signin = function() {
    Restangular.all('accounts').login($scope.loginuser).then(function(info) {
      console.log(info);
      if (info.response) {
        $cookies['token'] = info.data;
        $state.go('console');
      } else {
        console.log("Some fuck up happened");
      }
    }, function(err) {
      console.log(err);
    });
  };

});

function ForgotDialogCtrl($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
}