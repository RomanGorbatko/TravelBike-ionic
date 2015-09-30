/**
 * Created by roman on 9/22/15.
 */
var BackgroundGeolocationService = (function() {

  /**
   * @private BackgroundGeolocation plugin reference
   */
  var $plugin;

  /**
   * @private {String} platform
   */
  var $platform;

  /**
   * @private {object} BackgroundGeolocation configuration
   */
  var $config = {
    locationUpdateInterval: 1000,
    fastestLocationUpdateInterval: 500,
    activityRecognitionInterval: 200
  };

  /**
   * @private {object} localStorage driver
   */
  var localStorage = window.localStorage;

  /**
   * @private {Array} List of subscribers to the plugin's "location" event.  The plugin itself doesn't allow multiple listeners so I've simply added the ability here in Javascript.
   */
  var $locationListeners = [];

  /**
   * This is the BackgroundGeolocation callback.  I've set up the ability to add multiple listeners here so this
   * callback simply calls upon all the added listeners here
   */
  var fireLocationListeners = function(location, taskId) {
    console.log('[js] BackgroundGeolocation location received: ' + JSON.stringify(location));
    var me = this;
    var callback;
    for (var n=0,len=$locationListeners.length;n<len;n++) {
      callback = $locationListeners[n];
      try {
        callback.call(me, location);
      } catch (e) {
        console.log('error: ' + e.message);
      }
    }
    $plugin.finish(taskId);
  };

  return {
    setDependencies: function(obj) {
      if (obj) {
        if (obj['localStorage']) {
          localStorage = obj['localStorage'];
        }
        if (obj['plugin']) {
          $plugin = obj['plugin'];
        }
      }

      this.configurePlugin();
    },

    configurePlugin: function() {
      $platform = ionic.Platform.device().platform;

      $plugin.configure(fireLocationListeners, function(error) {
        console.warn('BackgroundGeolocation Error: ' + error);
      }, this.getConfig());

      if (this.getStarted()) {
        $plugin.start();
      }
    },

    /**
     * Return the current BackgroundGeolocation config-state as stored in localStorage
     * @return {Object}
     */
    getConfig: function() {
      return $config;
    },

    /**
     * Set the plugin state to track in background
     * @param {Boolean} willEnable
     */
    setStarted: function(willEnable, callback) {
      window.localStorage.setItem('bgGeo:started', willEnable);
      if ($plugin) {
        if (willEnable) {
          $plugin.start(callback);
        } else {
          $plugin.stop(callback);
        }
      }
    },

    /**
     * Is the plugin enabled to run in background?
     * @return {Boolean}
     */
    getStarted: function() {
      return localStorage.getItem('bgGeo:started') === 'true';
    },

    /**
     * Add an event-listener for location-received from $plugin
     * @param {Function} callback
     */
    onLocation: function(callback) {
      $locationListeners.push(callback);
    },

    /**
     * Return a reference to Cordova BackgroundGeolocation plugin
     * @return {BackgroundGeolocation}
     */
    getPlugin: function() {
      return $plugin;
    },

    getCurrentPosition: function(callback, failure) {
      if ($plugin) {
        $plugin.getCurrentPosition(callback, failure);
      }
    },

    finish: function(taskId) {
      console.log('- BackgroundGeolocationService#finish, taskId: ', taskId);
      if ($plugin) {
        $plugin.finish(taskId);
      }
    },

    /**
     * Toggle stationary/aggressive mode
     * @param {Boolean} willStart
     */
    setPace: function(willStart) {
      localStorage.setItem('bgGeo:started', willStart);
      if ($plugin) {
        $plugin.changePace(willStart);
      }
    },
  }

})();
