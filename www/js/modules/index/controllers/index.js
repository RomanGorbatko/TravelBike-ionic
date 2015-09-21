/**
 * Created by roman on 9/21/15.
 */
angular.module('tb.controllers.index', [])
  .controller('index', function($scope, $location, $window, $state, $ionicHistory) {
    $scope.location = $location;
    $scope.$storage = $window.localStorage;
    if ($scope.$storage.user) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('home', {}, {reload: true})
    }
  });
