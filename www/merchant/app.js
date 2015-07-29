var merchantApp = angular.module('merchantApp', ['ui.router', 'ngCookies', 'angularMoment', 'toastr'])
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
