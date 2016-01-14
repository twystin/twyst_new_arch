angular.module('consoleApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'oitozero.ngSweetAlert', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ordinal', 'ngFileUpload', 'uiGmapgoogle-maps', 'mgo-angular-wizard', 'ui.select2', 'frapontillo.bootstrap-switch', 'ui.tree', 'toastr', 'ordinal'])
    .run(function($rootScope, $state, $cookies) {
        $rootScope.token = $cookies.get('token');
        $rootScope.role = $cookies.get('role');
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
    });
