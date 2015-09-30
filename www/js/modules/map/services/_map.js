/**
 * Created by roman on 9/21/15.
 */
/**
 * Created by roman on 9/7/15.
 */
var BackgroundGeolocationService = (function() {
  /**
   * @private sound-id mapping for iOS & Android.  BackgroundGeolocation plugin has a simple system-sound API
   */
  var $SOUNDS = {
    "LONG_PRESS_ACTIVATE_IOS": 1113,
    "LONG_PRESS_ACTIVATE_ANDROID": 27,
    "LONG_PRESS_CANCEL_IOS": 1075,
    "LONG_PRESS_CANCEL_ANDROID": 94,
    "ADD_GEOFENCE_IOS": 1114,
    "ADD_GEOFENCE_ANDROID": 28,
    "BUTTON_CLICK_IOS": 1104,
    "BUTTON_CLICK_ANDROID": 89,
    "MESSAGE_SENT_IOS": 1303,
    "MESSAGE_SENT_ANDROID": 90,
    "ERROR_IOS": 1006
  };

  /**
   * @private {Array} List of subscribers to the plugin's "location" event.  The plugin itself doesn't allow multiple listeners so I've simply added the ability here in Javascript.
   */
  var $locationListeners = [];

  /**
   * @private {object} BackgroundGeolocation configuration
   */
  var $config = {};

  /**
   * @private BackgroundGeolocation plugin reference
   */
  var $plugin;

  /**
   * @private {String} platform
   */
  var $platform;

  /**
   * @private {object} localStorage driver
   */
  var localStorage = window.localStorage;

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
    /**
     * Set the plugin state to track in background
     * @param {Boolean} willEnable
     */
    setEnabled: function(willEnable, callback) {
      window.localStorage.setItem('bgGeo:enabled', willEnable);
      if ($plugin) {
        if (willEnable) {
          $plugin.start(callback);
        } else {
          $plugin.stop(callback);
        }
      }
    },

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

      if (this.getEnabled()) {
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
     * Is the plugin enabled to run in background?
     * @return {Boolean}
     */
    getEnabled: function() {
      return localStorage.getItem('bgGeo:enabled') === 'true';
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

    playSound: function(action) {
      if ($plugin) {
        var soundId = $SOUNDS[action + '_' + $platform.toUpperCase()];
        if (soundId) {
          $plugin.playSound(soundId);
        } else {
          console.warn('Failed to locate sound-id "' + action + '"');
        }
      }
    }
  }

})();
