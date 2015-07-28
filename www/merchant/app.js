var merchantApp = angular.module('merchantApp', ['ui.router', 'ngCookies', 'angularMoment'])
  .config(function($stateProvider, $urlRouterProvider) {
  	$urlRouterProvider.otherwise('/fourofour');
  	$stateProvider
  	.state('home', {
  		url: '/home',
  		views: {
  			'content': {
  				controller: 'HomeCtrl',
  				templateUrl: 'templates/home/home.html'
  			},
  			'footer': {
  				templateUrl: 'templates/common/footer.html' 
  			}
  		}
  	})
  })
