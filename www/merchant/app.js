var merchantApp = angular.module('merchantApp', ['ui.router', 'ui.bootstrap', 'ngCookies', 'angularMoment', 'toastr', 'angular-loading-bar', 'ngAnimate', 'ngStorage', 'mgo-angular-wizard', 'uiGmapgoogle-maps', 'ngFileUpload', 'ordinal'])
  .config(function($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        key: 'AIzaSyALU-FlIm704rdvaZFVujipV4SVxR4Kt9A',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
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
    .state('hub.offers', {
      url: '/offers',
      templateUrl: 'templates/hub/offers.html'
    })
    .state('hub.create_offer', {
      url: '/offers/create',
      templateUrl: 'templates/hub/offer_create.html',
      controller: 'OfferCreateController'
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
    .state('hub.list_bill_uploads', {
      url: '/bill_uploads',
      templateUrl: 'templates/hub/list_bill_uploads.html',
      controller: 'BillUploadsListController'
    })
    .state('hub.view_bill_upload', {
      url: '/bill_uploads/:bill_id',
      templateUrl: 'templates/hub/view_bill_upload.html',
      controller: 'BillUploadViewController'
    })
  })
