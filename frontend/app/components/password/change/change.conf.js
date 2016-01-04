angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('password.change', {
    url: '/password/change',
    params: {
      alert: undefined
    },
    templateUrl: 'components/password/change/change.html',
    controller: 'ChangePasswordCtrl as changePassword'
  })
});
