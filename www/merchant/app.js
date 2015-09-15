angular.module('merchantApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'toastr', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ordinal', 'ngFileUpload', 'uiGmapgoogle-maps', 'mgo-angular-wizard'])
	.run(function($rootScope, $state, $cookies) {
		$rootScope.token = $cookies.get('token');
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
				url: '/offers/view/:offer_group',
				templateUrl: 'templates/offers/view.html',
				controller: 'OfferViewController'
			})
			.state('merchant.edit_offer', {
				url: '/offers/edit/:offer_group',
				templateUrl: 'templates/offers/edit.html',
				controller: 'OfferEditController'
			})
			.state('merchant.analytics', {
				url: '/analytics',
				templateUrl: 'templates/analytics/home.html'
			})
			.state('merchant.panel', {
				url: '/panel',
				templateUrl: 'templates/panel/home.html'
			})
			.state('merchant.profile', {
				url: '/profile',
				templateUrl: 'templates/profile/home.html'
			})
	})