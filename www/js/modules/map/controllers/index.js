/**
 * Created by roman on 9/22/15.
 */
angular.module('tb.controllers.map', [])
  .controller('map-home', function($scope, $window, $log, $cordovaDialogs, server, $http) {

    ionic.Platform.ready(function() {
      BackgroundGeolocationService.onLocation($scope.onChangePosition);
    });

    // reset flag
    $window.localStorage.setItem('bgGeo:started', false);
    $window.localStorage.setItem('bgGeo:pause', false);

    $scope.bgGeo = {
      started: $window.localStorage.getItem('bgGeo:started') == 'true',
      pause: $window.localStorage.getItem('bgGeo:pause') == 'true'
    };

    $scope.startButtonColor = ($scope.bgGeo.started) ? '#ff0000' : '#3d3d3d';
    $scope.map                    = undefined;
    $scope.currentLocationMarker  = undefined;
    $scope.previousLocation       = undefined;
    $scope.startMarkers           = [];
    $scope.geofenceMarkers        = [];
    $scope.pauseMarkers           = [];
    $scope.paths                  = [];
    $scope.currentLocationMarker  = undefined;
    $scope.locationAccuracyMarker = undefined;
    $scope.stationaryRadiusMarker = undefined;
    $scope.stopMarker             = undefined;

    $scope.odometer = 0;
    $scope.cutIndex = 0;

    /**
     * Метод вызывается после рендеринга карты.
     * Инициирует события и вызывает $scope.centerOnMe()
     *
     * @param map
     */
    $scope.mapCreated = function(map) {
      $log.info('- Map started');

      $scope.map = map;
      // Add custom LongPress event to google map so we can add Geofences with longpress event!
      new LongPress(map, 500);

      // Draw a red circle around the Marker we wish to move.
      var geofenceCursor = new google.maps.Marker({
        map: map,
        clickable: false,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 100,
          fillColor: '#11b700',   //'2f71ff',
          fillOpacity: 0.2,
          strokeColor: '#11b700', // 2f71ff
          strokeWeight: 2,
          strokeOpacity: 0.9
        }
      });

      $scope.centerOnMe();
    };

    /**
     * Получает текущее местоположение маркера,
     * и центрирует экран на нем.
     */
    $scope.centerOnMe = function (cl) {
      if (!$scope.map) {
        return;
      }

      BackgroundGeolocationService.getCurrentPosition(function(location, taskId) {
        $scope.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
        $scope.setCurrentLocationMarker(location);
        BackgroundGeolocationService.finish(taskId);

        if ('function' == typeof cl) {
          cl(location);
        }
      }, function(error) {
        $log.error("- getCurrentPostion failed: " + error);
      });
    };

    /**
     * Устанавливает маркер в точке текущего
     * местоположения.
     *
     * @param location
     */
    $scope.setCurrentLocationMarker = function(location) {
      var plugin = BackgroundGeolocationService.getPlugin();

      // Set currentLocation @property
      $scope.currentLocation = location;

      var coords = location.coords;

      var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);

      if (!$scope.currentLocationMarker) {
        $scope.currentLocationMarker = new google.maps.Marker({
          map: $scope.map,
          zIndex: 10,
          title: 'Current Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#2677FF',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeOpacity: 1,
            strokeWeight: 6
          }
        });
      }

      $scope.currentLocationMarker.setPosition(latlng);
    };

    /**
     * Событие отрабатывает нажатие на
     * кропку Start.
     *
     */
    $scope.onClickStart = function() {
      var willStart = !$scope.bgGeo.started;
      $log.info('onClickStart: ', willStart);
      $scope.bgGeo.started    = willStart;
      $scope.startButtonColor = ($scope.bgGeo.started) ? '#ff0000' : '#3d3d3d';

      BackgroundGeolocationService.setStarted(willStart, function() {
        if (willStart) {
          $scope.cutIndex++;

          $scope.centerOnMe(function(location) {
            setActionMarker.to(new google.maps.LatLng(location.coords.latitude, location.coords.longitude)).start();
          });

          $scope.paths[$scope.cutIndex] = new google.maps.Polyline({
            zIndex: 1,
            map: $scope.map,
            geodesic: true,
            strokeColor: '#2677FF',
            strokeOpacity: 0.7,
            strokeWeight: 5
          });
        }
      });
    };

    $scope.onClickPause = function() {
      if ($scope.bgGeo.started) {
        var willPause = !$scope.bgGeo.pause;
        $log.info('onClickPause: ', willPause);
        $scope.bgGeo.pause    = willPause;


        if (!willPause) {
          $scope.cutIndex++;
        }
        BackgroundGeolocationService.setStarted(true, function() {
          $scope.centerOnMe(function(location) {
            if (willPause) {
              setActionMarker.to(new google.maps.LatLng(location.coords.latitude, location.coords.longitude)).pause();
            } else {
              setActionMarker.to(new google.maps.LatLng(location.coords.latitude, location.coords.longitude)).start();
            }
          });
        });
      }
    };

    $scope.onClickStop = function() {
      $cordovaDialogs.prompt('Track name', 'Save track', ['Cancel', 'Save'], '')
        .then(function(result) {
          var input = result.input1;
          // no button = 0, 'Cancel' = 1, 'Save' = 2
          var btnIndex = result.buttonIndex;
          if (btnIndex == '2') {
            if (!$scope.bgGeo.pause) {
              BackgroundGeolocationService.setStarted(false, function() {
                $scope.centerOnMe(function(location) {
                  setActionMarker.to(new google.maps.LatLng(location.coords.latitude, location.coords.longitude)).stop();
                  $scope.bgGeo.started = false;
                  $scope.currentLocationMarker.setMap(null);
                  saveData(input);
                });
              });
            }
          }
        });
    };

    /**
     * Event-listener передвижений.
     *
     * @param location
     */
    $scope.onChangePosition = function(location) {
      $log.info('- New position ');

      var latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
      if ($scope.bgGeo.started) {
        if (!$scope.bgGeo.pause) {
          setPath(latlng);
        }

        $scope.map.setCenter(latlng);
        $scope.setCurrentLocationMarker(location);
      }
    };

    var saveData = function(name) {
      var data = {},
          paths = $scope.paths;

      paths.shift();

      data['name'] = name || undefined;
      data['track'] = [];

      paths.forEach(function(el) {
        data['track'].push(el.getPath().getArray());
      });

      $http.post(server.backend + '/add_new_route', {params: data}).
        success(function(data, status, headers, config) {

        }).
        error(function(data, status, headers, config) {

        });
    };

    var setPath = function(latlng) {
      if ('undefined' == typeof $scope.paths[$scope.cutIndex]) {
        $scope.paths[$scope.cutIndex] = new google.maps.Polyline({
          zIndex: 1,
          map: $scope.map,
          geodesic: true,
          strokeColor: '#2677FF',
          strokeOpacity: 0.7,
          strokeWeight: 5

        });
      }

      $log.debug('paths:', $scope.paths, $scope.cutIndex);
      $scope.paths[$scope.cutIndex].getPath().push(latlng);
    };

    /**
     * Сеттер маркеров для определенного действия
     *
     * @type {{latlng: undefined, to: Function, start: Function, pause: Function, stop: Function}}
     */
    var setActionMarker = {
      latlng: undefined,
      to: function (latlng) {
        this.latlng = latlng;

        return this;
      },
      start: function() {
        $log.debug('- setActionMarker::start cutIndex:', $scope.cutIndex);
        $scope.startMarkers[$scope.cutIndex] = new google.maps.Marker({
          zIndex: 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#11b700',//'26cc77',
            fillOpacity: 1,
            strokeColor: '#0d6104',
            strokeWeight: 1,
            strokeOpacity: 0.7
          },
          map: $scope.map,
          position: this.latlng
        });
      },
      pause: function() {
        $log.debug('- setActionMarker::pause cutIndex:', $scope.cutIndex);
        setPath(this.latlng);
        $scope.pauseMarkers[$scope.cutIndex] = new google.maps.Marker({
          zIndex: 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#F5E00F',//'26cc77',
            fillOpacity: 1,
            strokeColor: '#F5890F',
            strokeWeight: 1,
            strokeOpacity: 0.7
          },
          map: $scope.map,
          position: this.latlng
        });
      },
      stop: function() {
        $log.debug('- setActionMarker::stop!');
        setPath(this.latlng);
        $scope.stopMarker = new google.maps.Marker({
          zIndex: 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#FF0000',//'26cc77',
            fillOpacity: 1,
            strokeColor: '#F0BCBC',
            strokeWeight: 1,
            strokeOpacity: 0.7
          },
          map: $scope.map,
          position: this.latlng
        });
      }
    }
  });
