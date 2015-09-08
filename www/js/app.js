
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova', 'ngStorage', 'ngMessages', 'uiGmapgoogle-maps'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.constant('TB', {
  backend: 'http://localhost:1337/api',
  version: 0.1
})

.config(function($stateProvider, $urlRouterProvider, $localStorageProvider, uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    china: true
  });

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })
    .state('index', {
      url: '/index',
      views: {
        'menuContent': {
          templateUrl: 'templates/index.html',
          controller: 'index'
        }
      },
      parent: "app"
    })
    .state('login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'login'
        }
      },
      parent: "app"
    })
    .state('signup', {
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'signup'
        }
      },
      parent: "app"
    })
    .state('home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'home'
        }
      },
      parent: "app"
    })
  ;
    //$localStorageProvider.set('user', {})
  // if none of the above states are matched, use this as the fallback
  if (!$localStorageProvider.get('user')['id']) {
    $urlRouterProvider.otherwise('/app/index');
  } else {
    $urlRouterProvider.otherwise('/app/home');
  }

});
