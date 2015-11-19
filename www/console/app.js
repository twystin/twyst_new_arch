angular.module('consoleApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'toastr', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'ngFileUpload', 'ordinal', 'monospaced.qrcode'])
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
			.state('console.outlets', {
				url: '/outlets',
				templateUrl: 'templates/outlet/manage.html',
				controller: 'OutletManageController'
			})
			.state('console.outlet_view', {
				url: '/outlets/view/:outlet_id',
				templateUrl: 'templates/outlet/view.html',
				controller: 'OutletViewController'
			})
			.state('console.offers', {
				url: '/offers',
				templateUrl: 'templates/offers/manage.html',
				controller: 'OfferManageController'
			})
			.state('console.offer_view', {
				url: '/offers/:offer_id',
				templateUrl: 'templates/offers/view.html',
				controller: 'OfferViewController'
			})
			.state('console.merchant', {
				url: '/merchant',
				templateUrl: 'templates/merchant/manage.html',
				controller: 'MerchantManageController'
			})
			.state('console.register_merchant', {
				url: '/merchant/register',
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
			.state('console.suggested_outlets', {
				url: '/suggested_outlets',
				templateUrl: 'templates/suggested_outlets/manage.html',
				controller: 'SuggestedOutletsController'
			})
			.state('console.submitted_offers', {
				url: '/submitted_offers',
				templateUrl: 'templates/submitted_offers/manage.html',
				controller: 'SubmittedOffersController'
			})
			.state('console.submitted_offer_view', {
				url: '/submitted_offers/:submitted_offer_id',
				templateUrl: 'templates/submitted_offers/view.html',
				controller: 'SubmittedOfferViewController'
			})
			.state('console.user_feedback', {
				url: '/user_feedback',
				templateUrl: 'templates/user_feedback/manage.html',
				controller: 'UserFeedbackController'
			})
			.state('console.write_to_twyst', {
				url: '/write_to_twyst',
				templateUrl: 'templates/write_to_twyst/manage.html',
				controller: 'WriteToTwystController'
			})
			.state('console.report_problem', {
				url: '/report_problem',
				templateUrl: 'templates/report_problem/manage.html',
				controller: 'ReportProblemController'
			})
			.state('console.bulk_checkin', {
				url: '/bulk_checkin',
				templateUrl: 'templates/bulk_checkin/manage.html',
				controller: 'BulCheckinController'
			})
	});