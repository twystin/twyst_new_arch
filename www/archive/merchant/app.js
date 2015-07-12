var twystMerchant = angular.module('twystMerchant', ['ngMaterial', 'ui.router', 'ngCookies', 'angularMoment', 'twyst.store']).
    config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
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
                                resUser: function(twystRESTSvc, $timeout) {
                                    return twystRESTSvc.profile();
                                },
                                authenticated: function($cookies) {
                                    if ($cookies.get('token')) {
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
                .state('console.view', {
                    url: '/view',
                    templateUrl: 'partials/console/manage/outlet.view.html'
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

    })
    .run(function($rootScope, $cookies) {
        $rootScope.debug = true;

    });
