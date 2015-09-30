
angular.module('tb', [
  // basic
  'ionic',
  'tb.routes',
  'tb.config',

  // contollers
  'tb.controllers.index',
  'tb.controllers.user',
  'tb.controllers.map',

  // directives
  'tb.directives.map',

  // deps
  'ngCordova',
  'ngMessages',
  'dtrw.bcrypt'
])

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

    if (window.BackgroundGeolocation) {
      console.log('BackgroundGeolocation ready');
      BackgroundGeolocationService.setDependencies({
        plugin: window.BackgroundGeolocation
      });
    }
  });
});
