angular.module('merchantApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'toastr', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ordinal', 'ngFileUpload', 'uiGmapgoogle-maps', 'mgo-angular-wizard'])
	.run(function($rootScope, $state, $cookies) {
		$rootScope.token = $cookies.get('token');
		$rootScope.isPaying = $cookies.get('isPaying')=='false'? false: true;
	})
	.config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {

		uiGmapGoogleMapApiProvider.configure({
	        key: 'AIzaSyALU-FlIm704rdvaZFVujipV4SVxR4Kt9A',
	        v: '3.17',
	        libraries: 'weather,geometry,visualization'
	    });

		$urlRouterProvider.when('', '/');
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('merchant', {
				url: '',
				templateUrl: 'templates/base.html',
				controller: 'RootController'
			})
			.state('merchant.default', {
				url: '/',
				templateUrl: 'templates/default.html',
				controller: 'BaseController'
			})
			.state('merchant.login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'LoginController'
			})
			.state('merchant.home', {
				url: '/home',
				templateUrl: 'templates/home.html'
			})
			.state('merchant.outlets', {
				url: '/outlets',
				templateUrl: 'templates/outlets/manage.html',
				controller: 'OutletManageController'
			})
			.state('merchant.create_outlet', {
				url: '/outlets/create',
				templateUrl: 'templates/outlets/create.html',
				controller: 'OutletCreateController'
			})
			.state('merchant.view_outlet', {
				url: '/outlets/view/:outletId',
				templateUrl: 'templates/outlets/view.html',
				controller: 'OutletViewController'
			})
			.state('merchant.edit_outlet', {
				url: '/outlets/edit/:outletId',
				templateUrl: 'templates/outlets/edit.html',
				controller: 'OutletEditController'
			})
			.state('merchant.menus', {
				url: '/menus',
				templateUrl: 'templates/menus/manage.html',
				controller: 'MenuManageController'
			})
			.state('merchant.create_menu', {
				url: '/menus/create',
				templateUrl: 'templates/menus/create.html',
				controller: 'MenuCreateController'
			})
			.state('merchant.edit_menu', {
				url: '/menus/:menu_id',
				templateUrl: 'templates/menus/update.html',
				controller: 'MenuEditController'
			})
			.state('merchant.offers', {
				url: '/offers',
				templateUrl: 'templates/offers/manage.html',
				controller: 'OfferManageController'
			})
			.state('merchant.create_offer', {
				url: '/offers/create',
				templateUrl: 'templates/offers/create.html',
				controller: 'OfferCreateController'
			})
			.state('merchant.view_offer', {
				url: '/offers/view/:offer_id',
				templateUrl: 'templates/offers/view.html',
				controller: 'OfferViewController'
			})
			.state('merchant.edit_offer', {
				url: '/offers/edit/:offer_id',
				templateUrl: 'templates/offers/edit.html',
				controller: 'OfferEditController'
			})
			.state('merchant.analytics', {
				url: '/analytics',
				templateUrl: 'templates/analytics/home.html'
			})
			.state('merchant.panel', {
				url: '/panel',
				templateUrl: 'templates/panel/home.html',
				controller: 'PanelHomeController'
			})
			.state('merchant.profile', {
				url: '/profile',
				templateUrl: 'templates/profile/home.html'
			})
			.state('merchant.bill_uploads', {
				url: '/bill_uploads',
				templateUrl: 'templates/bill_uploads/manage.html',
				controller: 'BillManageController'
			})
			.state('merchant.view_bill', {
				url: '/bill_uploads/:bill_id',
				templateUrl: 'templates/bill_uploads/view.html',
				controller: 'BillViewManageController'
			})
	})