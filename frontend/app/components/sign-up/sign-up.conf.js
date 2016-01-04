angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('sign-up', {
    url: '/sign-up?role',
    params: {
      alert: undefined,
      comeBack: undefined,
      hiring: undefined,
      posting: undefined
    },
    templateUrl: 'components/sign-up/sign-up.html',
    controller: 'SignUpCtrl as signUp'
  })
});
