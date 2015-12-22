angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('password.request', {
    url: '/password/request',
    params: {
      alert: undefined
    },
    templateUrl: '/components/password/request/request.html',
    controller: 'RequestPasswordCtrl as request'
  })
});
