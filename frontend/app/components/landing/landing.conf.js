angular.module('tf-client')
.config(function($stateProvider) {

  $stateProvider.state('landing', {
    url: '/',
    templateUrl: 'components/landing/landing.html',
    controller: 'LandingCtrl as landing'
  })
});
