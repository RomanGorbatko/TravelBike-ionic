angular.module('starter.controllers', ['dtrw.bcrypt'])

.controller('AppCtrl', function($scope, $http, bcrypt) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    $http.get('http://localhost:1337/auth/login', {params: loginData}).
      success(function(data, status, headers, config) {
        console.log(data);
      }).
      error(function(data, status, headers, config) {
        alert(data.message);
      });
  };
})

.controller('login', function($scope, $cordovaOauth, $localStorage, $http) {
    $scope.facebookLogin = function() {
      console.log('facebookLogin');
      $cordovaOauth.facebook("1481045002192353", ['email', 'public_profile', 'user_photos']).then(function(result) {
        $localStorage.accessToken = result.access_token;
        //console.log(result.access_token);

        $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,email,birthday,picture", format: "json" }}).then(function(result) {
          for (res in result.data) {
            if (res == 'picture') {
              console.log(res + ': ' + result.data[res]['data']);
            } else {
              console.log(res + ': ' + result.data[res]);
            }
          }
        }, function(error) {
          for (e in error) {
            console.log(e + ' error: ' + error[e]);
          }
          alert("There was a problem getting your profile.  Check the logs for details.");
        });
      }, function(error) {
        console.log('error: ' + error);
      });
    }
});
