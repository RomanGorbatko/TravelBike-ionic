/**
 * Created by roman on 9/21/15.
 */
angular.module('tb.controllers.map', [])
  .controller('map-home', function($scope, $window) {

  var PLAY_BUTTON_CLASS = "ion-play button-balanced",
    PAUSE_BUTTON_CLASS = "ion-pause button-assertive";

  // Add BackgroundGeolocation event-listeners when Platform is ready.
  ionic.Platform.ready(function() {
    BackgroundGeolocationService.onLocation($scope.setCurrentLocationMarker);
    //BackgroundGeolocationService.onMotionChange($scope.onMotionChange);
    //BackgroundGeolocationService.onGeofence($scope.onGeofence);
  });

  /**
   * BackgroundGelocation plugin state
   */

  // reset
  $window.localStorage.setItem('bgGeo:enabled', true);
  $window.localStorage.setItem('bgGeo:started', false);

  $scope.bgGeo = {
    enabled: $window.localStorage.getItem('bgGeo:enabled') == 'true',
    started: $window.localStorage.getItem('bgGeo:started') == 'true'
  };

  $scope.startButtonIcon = ($scope.bgGeo.started) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;
  $scope.map                    = undefined;
  $scope.currentLocationMarker  = undefined;
  $scope.previousLocation       = undefined;
  $scope.locationMarkers        = [];
  $scope.geofenceMarkers        = [];
  $scope.path                   = undefined;
  $scope.currentLocationMarker  = undefined;
  $scope.locationAccuracyMarker = undefined;
  $scope.stationaryRadiusMarker = undefined;

  $scope.odometer = 0;

  /**
   * Center map button
   */
  $scope.centerOnMe = function () {
    if (!$scope.map) {
      return;
    }

    BackgroundGeolocationService.getCurrentPosition(function(location, taskId) {
      $scope.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
      $scope.setCurrentLocationMarker(location);
      BackgroundGeolocationService.finish(taskId);
    }, function(error) {
      console.error("- getCurrentPostion failed: ", error);
    });
  };

  /**
   * Start/stop aggressive monitoring / stationary mode
   */
  $scope.onClickStart = function() {
    var willStart = !$scope.bgGeo.started;
    console.log('onClickStart: ', willStart);
    $scope.bgGeo.started    = willStart;
    $scope.startButtonIcon  = (willStart) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;

    BackgroundGeolocationService.setPace(willStart);
  };

  $scope.mapCreated = function(map) {
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

    // Tap&hold detected.  Play a sound a draw a circular cursor.
    google.maps.event.addListener(map, 'longpresshold', function(e) {
      geofenceCursor.setPosition(e.latLng);
      geofenceCursor.setMap(map);
      BackgroundGeolocationService.playSound('LONG_PRESS_ACTIVATE')
    });

    // Longpress cancelled.  Get rid of the circle cursor.
    google.maps.event.addListener(map, 'longpresscancel', function() {
      geofenceCursor.setMap(null);
      BackgroundGeolocationService.playSound('LONG_PRESS_CANCEL');
    });

    // Longpress initiated, add the geofence
    google.maps.event.addListener(map, 'longpress', function(e) {
      $scope.onAddGeofence(geofenceCursor.getPosition());
      geofenceCursor.setMap(null);
    });

    // Add BackgroundGeolocationService event-listeners when Platform is ready.
    ionic.Platform.ready(function() {
      var bgGeo = BackgroundGeolocationService.getPlugin();
      if (!bgGeo) { return; }
      bgGeo.getGeofences(function(rs) {
        for (var n=0,len=rs.length;n<len;n++) {
          createGeofenceMarker(rs[n]);
        }
      });
      $scope.centerOnMe();
    });
  };

  /**
   * Draw google map marker for current location
   */
  $scope.setCurrentLocationMarker = function(location) {
    var plugin = BackgroundGeolocationService.getPlugin();

    if (plugin) {
      // Update odometer
      plugin.getOdometer(function(value) {
        $scope.$apply(function() {
          $scope.odometer = (value/1000).toFixed(1);
        });
      });
    }
    // Set currentLocation @property
    $scope.currentLocation = location;

    var coords = location.coords;

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
      $scope.locationAccuracyMarker = new google.maps.Circle({
        zIndex: 9,
        fillColor: '#3366cc',
        fillOpacity: 0.4,
        strokeOpacity: 0,
        map: $scope.map
      });
    }
    if (!$scope.bgGeo.enabled) {
      return;
    }
    if (!$scope.path) {
      $scope.path = new google.maps.Polyline({
        zIndex: 1,
        map: $scope.map,
        geodesic: true,
        strokeColor: '#2677FF',
        strokeOpacity: 0.7,
        strokeWeight: 5
      });
    }
    var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);

    if ($scope.previousLocation) {
      var prevLocation = $scope.previousLocation;
      // Drop a breadcrumb of where we've been.
      $scope.locationMarkers.push(new google.maps.Marker({
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
        position: new google.maps.LatLng(prevLocation.coords.latitude, prevLocation.coords.longitude)
      }));
    }

    // Update our current position marker and accuracy bubble.
    $scope.currentLocationMarker.setPosition(latlng);
    $scope.locationAccuracyMarker.setCenter(latlng);
    $scope.locationAccuracyMarker.setRadius(location.coords.accuracy);

    // Add breadcrumb to current Polyline path.
    $scope.path.getPath().push(latlng);
    $scope.previousLocation = location;
  };

  /**
   * show geofence modal
   * @param {Google.maps.Circle} circle
   */
  $scope.onShowGeofence = function(params) {
    BackgroundGeolocationService.playSound("LONG_PRESS_ACTIVATE");
    $scope.geofenceRecord = params;
    //$scope.showGeofenceModal.show();
  };

  /**
   * Enable BackgroundGeolocationService
   */
  $scope.onToggleEnabled = function() {
    var isEnabled = $scope.bgGeo.enabled;
    console.log('onToggleEnabled: ', isEnabled);
    BackgroundGeolocationService.setEnabled(isEnabled, function() {
      if (isEnabled) {
        $scope.centerOnMe();
      }
    });

    if (!isEnabled) {
      // Reset odometer to 0.
      var plugin = BackgroundGeolocationService.getPlugin();
      if (plugin) {
        plugin.resetOdometer(function() {
          $scope.$apply(function() {
            $scope.odometer = 0;
          });
        });
      }
      BackgroundGeolocationService.playSound('BUTTON_CLICK');
      $scope.bgGeo.started = false;
      $scope.startButtonIcon = PLAY_BUTTON_CLASS;

      // Clear previousLocation
      $scope.previousLocation = undefined;

      // Clear location-markers.
      var marker;
      for (var n=0,len=$scope.locationMarkers.length;n<len;n++) {
        marker = $scope.locationMarkers[n];
        marker.setMap(null);
      }
      $scope.locationMarkers = [];

      // Clear geofence markers.
      for (var n=0,len=$scope.geofenceMarkers.length;n<len;n++) {
        marker = $scope.geofenceMarkers[n];
        marker.setMap(null);
      }
      $scope.geofenceMarkers = [];


      // Clear red stationaryRadius marker
      if ($scope.stationaryRadiusMarker) {
        $scope.stationaryRadiusMarker.setMap(null);
      }

      // Clear blue route PolyLine
      if ($scope.path) {
        $scope.path.setMap(null);
        $scope.path = undefined;
      }
    }
  };

  /**
   * Create google.maps.Circle geofence marker.
   * @param {Object}
   */
  var createGeofenceMarker = function(params) {
    // Add longpress event for adding GeoFence of hard-coded radius 200m.
    var geofence = new google.maps.Circle({
      zIndex: 100,
      fillColor: '#11b700',
      fillOpacity: 0.2,
      strokeColor: '#11b700',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      params: params,
      radius: parseInt(params.radius, 10),
      center: new google.maps.LatLng(params.latitude, params.longitude),
      map: $scope.map
    });
    // Add 'click' listener to geofence so we can edit it.
    google.maps.event.addListener(geofence, 'click', function() {
      $scope.onShowGeofence(this.params);
    });
    $scope.geofenceMarkers.push(geofence);
    return geofence;
  };
});
