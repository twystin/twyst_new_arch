twystMerchant.controller('AuthCtrl', function($scope, $rootScope, $state, $mdDialog, $cookies, twystRESTSvc) {
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

  $scope.signed_in = function() {
    if ($cookies.token && $cookies.expiry) {
      if (moment().isBefore($cookies.expiry)) {
        $state.go('console');
      }
    }
  };

  $scope.sign_out = function() {
    delete $cookies.token;
    delete $cookies.expiry;
    $state.go('home');
  };

  // Method to sign the user in.
  $scope.signin = function() {

      twystRESTSvc.login($scope.loginuser).then(function(info) {
          console.log(info.response);
          if (info.response) {
              $cookies.put('token', info.data.token);
              $cookies.put('expiry', info.data.expiry);
              $state.go('console');
          } else {
              console.log("Some mess up happened");
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
