angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('taskerProfile', {
    url: '/profile?id',
    params: {
      alert: undefined
    },
    templateUrl: 'components/tasker/tasker-profile/tasker-profile.html',
    controller: 'TaskerProfileCtrl as taskerProfile'
  })
});
