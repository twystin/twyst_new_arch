var merchantApp = angular.module('merchantApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'toastr', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'mgo-angular-wizard'])
  .config(function($stateProvider, $urlRouterProvider) {
  	$urlRouterProvider.otherwise('/home');
  	$stateProvider
  	.state('home', {
  		url: '/home',
  		views: {
  			'content': {
  				controller: 'HomeCtrl',
  				templateUrl: 'templates/home/home.html'
  			}
  		}
  	})
    .state('hub', {
      url: '/hub',
      views: {
        'content': {
          controller: 'HomeCtrl',
          templateUrl: 'templates/hub/hub.html'
        }
      }
    })
    .state('hub.outlets', {
      url: '/outlets',
      controller: 'OutletsCtrl',
      templateUrl: 'templates/hub/outlets.html'
    })
    .state('hub.create_outlet', {
      url: '/outlets/new',
      controller: 'OutletCreateCtrl',
      templateUrl: 'templates/hub/create.html'
    })
    .state('hub.view_outlet_detail', {
      url: '/outlets/:outletId',
      controller: 'OutletViewCtrl',
      templateUrl: 'templates/hub/view.html'
    })
    .state('hub.analytics', {
      url: '/analytics',
      templateUrl: 'templates/hub/analytics.html'
    })
    .state('hub.profile', {
      url: '/profile',
      templateUrl: 'templates/hub/profile.html'
    })
    .state('hub.panel', {
      url: '/panel',
      templateUrl: 'templates/hub/panel.html'
    })
  })
