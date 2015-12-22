angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myTaskers.findTasker', {
    url: '/taskers/find?filter',
    params: {
      alert: undefined,
      filter: ''
    },
    templateUrl: 'components/owner/taskers/find-tasker/find-tasker.html',
    controller: 'FindTaskerCtrl as findTasker'
  });
});
