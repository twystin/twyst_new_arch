angular.module('consoleApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'toastr', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ngFileUpload', 'ordinal'])
	.run(function($rootScope, $state, $cookies) {
		$rootScope.token = $cookies.get('token');
	})
	.config(function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.when('', '/');
		$urlRouterProvider.otherwise('/');

		$stateProvider
			.state('console', {
				url: '',
				templateUrl: 'templates/base.html',
				controller: 'RootController'
			})
			.state('console.default', {
				url: '/',
				templateUrl: 'templates/default.html',
				controller: 'BaseController'
			})
			.state('console.login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'LoginController'
			})
			.state('console.home', {
				url: '/home',
				templateUrl: 'templates/home.html'
			})
			.state('console.merchant', {
				url: '/merchant',
				templateUrl: 'templates/merchant/register.html',
				controller: 'MerchantRegisterController'
			})
			.state('console.bills', {
				url: '/bills',
				templateUrl: 'templates/bills/manage.html',
				controller: 'BillManageController'
			})
			.state('console.view_bill', {
				url: '/bills/:bill_id',
				templateUrl: 'templates/bills/view.html',
				controller: 'BillViewController'
			})
	});