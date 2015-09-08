angular.module('starter.controllers', ['dtrw.bcrypt'])

.controller('AppCtrl', function($scope, $http, bcrypt, $cordovaDevice, $localStorage, $location, $cordovaOauth) {
    //console.log($localStorage);
})

.controller('login', function($scope, $window, $state, $http, bcrypt, $cordovaDevice, $localStorage, $location, $cordovaOauth, TB, $ionicHistory) {
  // Form data for the login modal
  $scope.loginData = {};
  $scope.$storage = $localStorage;
  var loginData = {};

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {

    //if ($cordovaDevice.getDevice()) {
    //  loginData.device = $cordovaDevice.getUUID();
    //}
    console.log('Doing login', $scope.loginData);

    $http.get(TB.backend + '/login', {params: $scope.loginData}).
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
  };

  $scope.location = $location;

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
})

.controller('signup', function($scope, $http, $localStorage, $state, TB, $ionicHistory) {
  $scope.signup = {
    name: '',
    email: '',
    password : ''
  };

  $scope.$storage = $localStorage;

  $scope.doSignup = function(form) {
    if(form.$valid || form.email.$error.check_email) {
      $http.get(TB.backend + '/check_email', {params: {email: $scope.signup.email}}).
        success(function(data) {
          form.email.$setValidity("check_email", true);
          $http.get(TB.backend + '/signup', {params: $scope.signup}).
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
})

.controller('index', function($scope, $location, $localStorage, $state, $ionicHistory) {
  $scope.location = $location;
  $scope.$storage = $localStorage;
  if ($scope.$storage.user.id) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('home', {}, {reload: true})
  }
})

.controller('home', function($scope, $localStorage, uiGmapGoogleMapApi) {
  $scope.$storage = $localStorage;
  $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
  $scope.myLocation = {
    lng : '',
    lat: ''
  }

  $scope.drawMap = function(position) {

    //$scope.$apply is needed to trigger the digest cycle when the geolocation arrives and to update all the watchers
    $scope.$apply(function() {
      $scope.myLocation.lng = position.coords.longitude;
      $scope.myLocation.lat = position.coords.latitude;

      $scope.map = {
        center: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        },
        zoom: 14,
        pan: 1
      };

      $scope.marker = {
        id: 0,
        coords: {
          latitude: $scope.myLocation.lat,
          longitude: $scope.myLocation.lng
        }
      };

      $scope.marker.options = {
        draggable: false,
        labelContent: "lat: " + $scope.marker.coords.latitude + '<br/> ' + 'lon: ' + $scope.marker.coords.longitude,
        labelAnchor: "80 120",
        labelClass: "marker-labels"
      };
    });
  }

  navigator.geolocation.getCurrentPosition($scope.drawMap);
});
