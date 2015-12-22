angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('password.reset', {
    url: '/password/reset?token',
    params: {
      alert: undefined,
      token: undefined
    },
    templateUrl: '/components/password/reset/reset.html',
    controller: 'ResetPasswordCtrl as reset'
  })
});
