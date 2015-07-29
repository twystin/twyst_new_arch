var merchantApp = angular.module('merchantApp', ['ui.router', 'ngCookies', 'angularMoment'])
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
  })
