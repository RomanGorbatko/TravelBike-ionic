/**
 * Created by roman on 9/21/15.
 */
angular.module('tb.controllers.user', [])
  .controller('login', function($scope, $state, $http, bcrypt, $cordovaDevice, $window, $location, $cordovaOauth, server, $ionicHistory) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.$storage = $window.localStorage;
    var loginData = {};

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {

      //if ($cordovaDevice.getDevice()) {
      //  loginData.device = $cordovaDevice.getUUID();
      //}
      console.log('Doing login', $scope.loginData);

      $http.get(server.backend + '/login', {params: $scope.loginData}).
        success(function(data, status, headers, config) {
          $scope.$storage.user = data.user;
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go('home', {}, {reload: true})
        }).
        error(function(data, status, headers, config) {
          alert((data !== null) ? data.message : "Request failed");
        });
    };

    $scope.location = $location;

    $scope.facebookLogin = function() {
      console.log('facebookLogin');
      $cordovaOauth.facebook("1481045002192353", ['email', 'public_profile', 'user_photos']).then(function(result) {
        $scope.$storage.accessToken = result.access_token;
        //console.log(result.access_token);

        $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: $scope.$storage.accessToken, fields: "id,name,email,birthday,picture", format: "json" }}).then(function(result) {
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
  })
  .controller('signup', function($scope, $http, $state, $window, server, $ionicHistory) {
    $scope.signup = {
      name: '',
      email: '',
      password : ''
    };

    $scope.$storage = $window.localStorage;

    $scope.doSignup = function(form) {
      if(form.$valid || form.email.$error.check_email) {
        $http.get(server.backend + '/check_email', {params: {email: $scope.signup.email}}).
          success(function(data) {
            form.email.$setValidity("check_email", true);
            $http.get(server.backend + '/signup', {params: $scope.signup}).
              success(function(data, status, headers, config) {
                $scope.$storage.user = data.user;
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go('home', {}, {reload: true})
              }).
              error(function(data, status, headers, config) {
                if (data !== null) {
                  alert(data.message);
                }
              });
          }).
          error(function(data) {
            if (data !== null) {
              if (data.key) {
                form.email.$setValidity("check_email", false);
              } else if (data.message) {
                alert(data.message);
              }
            }
          });
      }
    };
  });
