angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('login', {
    url: '/login',
    params: {
      alert: undefined,
      email: undefined,
      comeBack: undefined,
      expired: undefined,
      role: undefined
    },
    templateUrl: 'components/login/login.html',
    controller: 'LoginCtrl as login'
  })
});
