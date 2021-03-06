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
      templateUrl: 'templates/index/index.html',
      controller: 'index'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/user/login.html',
      controller: 'login'
    })
    .state('logout', {
      url: '/logout',
      views: {
        'menuContent': {
          controller: 'logout'
        }
      },
      parent: "app"
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/user/signup.html',
      controller: 'signup'
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
    $urlRouterProvider.otherwise('/index');
  } else {
    $urlRouterProvider.otherwise('/app/home');
  }

});
