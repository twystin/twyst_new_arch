angular.module('baseApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'toastr', 'ngAnimate', 'ngStorage', 'ordinal'])
	.config(function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.when('', '/');
		$urlRouterProvider.otherwise('/');

		$stateProvider.state('base', {
			url: '',
			templateUrl: 'templates/base.html',
			controller: 'RootController'
		})
		.state('base.default', {
			url: '/',
			templateUrl: 'templates/default.html'
		})

	});