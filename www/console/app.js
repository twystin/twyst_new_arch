angular.module('consoleApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'oitozero.ngSweetAlert', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ordinal', 'ngFileUpload', 'uiGmapgoogle-maps', 'mgo-angular-wizard', 'ui.select2', 'frapontillo.bootstrap-switch', 'ui.tree', 'toastr', 'ordinal', 'notification', 'ngAudio'])
    .run(function($rootScope, $state, $cookies, $notification, ngAudio) {
        $rootScope.faye = new Faye.Client('/faye');
        $rootScope.token = $cookies.get('token');
        $rootScope.role = $cookies.get('role');
        $rootScope.sound = ngAudio.load('sounds/song1.wav');
        $rootScope.sound.loop = true;
        $rootScope.paths = JSON.parse($cookies.get('paths') || '[]');
        $rootScope.notification_count = 0;
        _.each($rootScope.paths, function(path) {
            $rootScope.faye.subscribe(path, function(message) {
                $rootScope.notification_count += 1;
                $rootScope.sound.play();
                var notification = $notification('New Order', {
                    body: message.text || 'Message here',
                    delay: 0,
                    dir: 'auto'
                });

                notification.$on('click', function() {
                    console.debug('The user has clicked in my notification.');
                    notification.close();
                    // $rootScope.sound.stop();
                });

                notification.$on('close', function() {
                    console.debug('The user has closed my notification.');
                    notification.close();
                    $rootScope.notification_count -= 1;
                    if (!$rootScope.notification_count) {
                        $rootScope.sound.stop();
                    }
                });
            });
        });
    })
    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('console', {
                url: '',
                templateUrl: 'templates/header.html',
                controller: 'RootController'
            })
            .state('console.default', {
                url: '/',
                templateUrl: 'templates/merchants/manage.html',
                controller: 'MerchantManageController'
            })
            .state('console.login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginController'
            })
            .state('console.register_merchant', {
                url: '/merchants/new',
                templateUrl: 'templates/merchants/register.html',
                controller: 'RegisterMerchantController'
            })
            .state('console.outlets_manage', {
                url: '/outlets',
                templateUrl: 'templates/outlets/manage.html',
                controller: 'OutletManageController'
            })
            .state('console.outlets_view', {
                url: '/outlets/:outlet_id',
                templateUrl: 'templates/outlets/view.html',
                controller: 'OutletViewController'
            })
            .state('console.offers_manage', {
                url: '/offers',
                templateUrl: 'templates/offers/manage.html',
                controller: 'OfferManageController'
            })
            .state('console.offers_view', {
                url: '/offers/:offer_id',
                templateUrl: 'templates/offers/view.html',
                controller: 'OfferViewController'
            })
            .state('console.orders_manage', {
                url: '/orders',
                templateUrl: 'templates/orders/manage.html',
                controller: 'OrderManageController'
            })
            .state('console.orders_view', {
                url: '/orders/:order_id',
                templateUrl: 'templates/orders/view.html',
                controller: 'OrderViewController'
            })
            .state('console.bills_manage', {
                url: '/bills',
                templateUrl: 'templates/bills/manage.html',
                controller: 'BillManageController'
            })
            .state('console.bills_view', {
                url: '/bills/:bill_id',
                templateUrl: 'templates/bills/view.html',
                controller: 'BillViewController'
            })
            .state('console.menus_manage', {
                url: '/menus',
                templateUrl: 'templates/menus/manage.html',
                controller: 'MenuManageController'
            })
            .state('console.menus_edit', {
                url: '/menus/edit/:menu_id',
                templateUrl: 'templates/menus/edit.html',
                controller: 'MenuEditController'
            })
            .state('console.menus_view', {
                url: '/menus/view/:menu_id',
                templateUrl: 'templates/menus/view.html',
                controller: 'MenuViewController'
            })
            .state('console.suggested_outlets_manage', {
                url: '/suggested_outlets',
                templateUrl: 'templates/suggested_outlets/manage.html',
                controller: 'SuggestedOutletManageController'
            })
            .state('console.suggested_offers_manage', {
                url: '/suggested_offers',
                templateUrl: 'templates/suggested_offers/manage.html',
                controller: 'SuggestedOfferManageController'
            })
            .state('console.suggested_offers_view', {
                url: '/suggested_offers/:suggested_offer_id',
                templateUrl: 'templates/suggested_offers/view.html',
                controller: 'SuggestedOfferViewController'
            })
            .state('console.user_feedbacks_manage', {
                url: '/user_feedbacks',
                templateUrl: 'templates/user_feedbacks/manage.html',
                controller: 'UserFeedbackManageController'
            })
            .state('console.write_to_twysts_manage', {
                url: '/write_to_twyst',
                templateUrl: 'templates/write_to_twyst/manage.html',
                controller: 'WriteToTwystManageController'
            })
            .state('console.reported_problems_manage', {
                url: '/reported_problems',
                templateUrl: 'templates/reported_problems/manage.html',
                controller: 'ReportedProblemManageController'
            })
            .state('console.bulk_checkin', {
                url: '/bulk_checkin',
                templateUrl: 'templates/bulk_checkin/manage.html',
                controller: 'BulkCheckinController'
            })
            .state('console.menu_update_requests_manage', {
                url: '/menu_update_requests',
                templateUrl: 'templates/menu_update_requests/manage.html',
                controller: 'MenuUpdateRequestManageController'
            });
    });
