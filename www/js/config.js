/**
 * Created by roman on 9/21/15.
 */
angular.module('tb.config', [])
  .constant(
    'server', {
      backend: 'http://localhost:1337/api',
      version: 0.1
    }
  ).config(function($logProvider){
    $logProvider.debugEnabled(true);
  });
