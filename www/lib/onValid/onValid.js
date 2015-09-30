/**
 * Created by roman on 9/6/15.
 */
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'));
  } else {
    // Browser globals (root is window), we don't register it.
    factory(root.angular);
  }
}(this , function (angular) {
  'use strict';

  // RequireJS does not pass in Angular to us (will be undefined).
  // Fallback to window which should mostly be there.
  angular = (angular && angular.module ) ? angular : window.angular;

  /**
   * @ngdoc overview
   * @name onValid
   */

  return angular.module('onValid', [])

    .directive('formValidateAfter', formValidateAfter);

  function formValidateAfter() {
    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, ctrl) {
      var validateClass = 'form-validate';
      ctrl.validate = false;
      element.bind('focus', function (evt) {
        if (ctrl.validate && ctrl.$invalid) // if we focus and the field was invalid, keep the validation
        {
          element.addClass(validateClass);
          scope.$apply(function () { ctrl.validate = true; });
        }
        else {
          element.removeClass(validateClass);
          scope.$apply(function () { ctrl.validate = false; });
        }

      }).bind('blur', function (evt) {
        element.addClass(validateClass);
        scope.$apply(function () { ctrl.validate = true; });
      });
    }
  }

}));
