var twystMerchant = angular.module('twystMerchant', ['ngMaterial', 'ui.router', 'restangular', 'ngCookies', 'angularMoment', 'twyst.store']).
config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, RestangularProvider) {
  (function configureStates() {
    $urlRouterProvider.otherwise("/home");
    $stateProvider
      .state('home', {
        url: "/home",
        views: {
          "content": {
            controller: "AuthCtrl",
            templateUrl: "partials/home/home.html"
          },
          "footer": {
            templateUrl: "partials/common/footer.html"
          }
        }
      })
      .state('console', {
        url: '/console',
        views: {
          "content": {
            resolve: {
              resUser: function(Restangular) {
                // GET 0 means get me!
                return Restangular.one('profile').get();
              },
              authenticated: function($cookies) {
                if ($cookies.token) {
                  return true;
                } else {
                  return false;
                }
              }
            },
            controller: "ConsoleCtrl",
            templateUrl: "partials/console/console.html"
          },
          "footer": {
            templateUrl: "partials/common/footer.html"
          }
        }
      })
      .state('console.create', {
        url: '/create',
        templateUrl: "partials/console/create/outlet.create.html"
      })
      .state('console.manage', {
        url: '/manage',
        templateUrl: "partials/console/manage/outlet.manage.html"
      })
      .state('console.reports', {
        url: '/create',
        templateUrl: "partials/console/reports/reports.view.html"
      })
      .state('console.transactions', {
        url: '/create',
        templateUrl: "partials/console/panel/transactions.manage.html"
      });
  })();

  (function configureRESTAngular() {
    RestangularProvider.setBaseUrl('/api/v4');
    RestangularProvider.addElementTransformer('accounts', true, function(account) {
      account.addRestangularMethod('login', 'post', 'login');
      return account;
    });
  })();
})
.run(function($rootScope, $cookies, Restangular) {
  $rootScope.debug = true;
  Restangular.setDefaultRequestParams({token: $cookies.token});

});
