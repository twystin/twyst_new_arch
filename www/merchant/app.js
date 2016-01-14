angular.module('merchantApp', ['ui.router', 'ngAudio', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'oitozero.ngSweetAlert', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ordinal', 'ngFileUpload', 'uiGmapgoogle-maps', 'mgo-angular-wizard', 'ui.select2', 'frapontillo.bootstrap-switch', 'ui.tree', 'toastr', 'ordinal', 'notification'])
    .run(function($rootScope, $state, $cookies, ngAudio) {
        $rootScope.faye = new Faye.Client('/faye');
        $rootScope.token = $cookies.get('token');
        $rootScope.sound = ngAudio.load('sounds/song1.mp3');
        $rootScope.sound = ngAudio.load('sounds/song1.wav');
        $rootScope.sound.loop = true;
        $rootScope.isPaying = $cookies.get('isPaying') == 'true' ? true : false;
    })
    .config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyALU-FlIm704rdvaZFVujipV4SVxR4Kt9A',
            v: '3.17',
            libraries: 'weather,geometry,visualization,drawing'
        });

        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('merchant', {
                url: '',
                templateUrl: 'templates/header.html',
                controller: 'RootController'
            })
            .state('merchant.default', {
                url: '/',
                templateUrl: 'templates/panel.html',
                controller: 'OrderManageController'
            })
            .state('merchant.login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginController'
            })
            .state('merchant.outlets_manage', {
                url: '/outlets/manage',
                templateUrl: 'templates/outlets/manage.html',
                controller: 'OutletManageController'
            })
            .state('merchant.outlets_create', {
                url: '/outlets/create',
                templateUrl: 'templates/outlets/create.html',
                controller: 'OutletCreateController'
            })
            .state('merchant.outlets_edit', {
                url: '/outlets/edit/:outlet_id',
                templateUrl: 'templates/outlets/edit.html',
                controller: 'OutletEditController'
            })
            .state('merchant.outlets_view', {
                url: '/outlets/view/:outlet_id',
                templateUrl: 'templates/outlets/view.html',
                controller: 'OutletViewController'
            })
            .state('merchant.menus_manage', {
                url: '/menus/manage',
                templateUrl: 'templates/menus/manage.html',
                controller: 'MenuManageController'
            })
            .state('merchant.menus_create', {
                url: '/menus/create',
                templateUrl: 'templates/menus/create.html',
                controller: 'MenuCreateController'
            })
            .state('merchant.menus_edit', {
                url: '/menus/edit/:menu_id',
                templateUrl: 'templates/menus/edit.html',
                controller: 'MenuEditController'
            })
            .state('merchant.menus_view', {
                url: '/menus/view/:menu_id',
                templateUrl: 'templates/menus/view.html',
                controller: 'MenuViewController'
            })
            .state('merchant.offers_manage', {
                url: '/offers/manage',
                templateUrl: 'templates/offers/manage.html',
                controller: 'OfferManageController'
            })
            .state('merchant.offers_create', {
                url: '/offers/create',
                templateUrl: 'templates/offers/create.html',
                controller: 'OfferCreateController'
            })
            .state('merchant.offers_edit', {
                url: '/offers/edit/:offer_id',
                templateUrl: 'templates/offers/edit.html',
                controller: 'OfferEditController'
            })
            .state('merchant.offers_view', {
                url: '/offers/view/:offer_id',
                templateUrl: 'templates/offers/view.html',
                controller: 'OfferViewController'
            })
            .state('merchant.bills_manage', {
                url: '/bills/manage',
                templateUrl: 'templates/bills/manage.html',
                controller: 'BillManageController'
            })
            .state('merchant.bills_view', {
                url: '/bills/view/:bill_id',
                templateUrl: 'templates/bills/view.html',
                controller: 'BillViewController'
            })
    });
