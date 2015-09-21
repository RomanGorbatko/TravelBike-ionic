/**
 * Created by roman on 9/21/15.
 */
angular.module('tb.routes', []).config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/index/menu.html'
    })
    .state('index', {
      url: '/index',
      views: {
        'menuContent': {
          templateUrl: 'templates/index/index.html',
          controller: 'index'
        }
      },
      parent: "app"
    })
    .state('login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/user/login.html',
          controller: 'login'
        }
      },
      parent: "app"
    })
    .state('signup', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/user/signup.html',
          controller: 'signup'
        }
      },
      parent: "app"
    })
    .state('home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/map/home.html',
          controller: 'map-home'
        }
      },
      parent: "app"
    })
  ;

  if (!window.localStorage['user']) {
    $urlRouterProvider.otherwise('/app/index');
  } else {
    $urlRouterProvider.otherwise('/app/home');
  }

});
