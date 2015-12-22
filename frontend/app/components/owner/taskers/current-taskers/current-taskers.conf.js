angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myTaskers.currentTaskers', {
    url: '/taskers/current?job&status&page',
    params: {
      alert: undefined,
      job: '',
      status: '',
      page: '1'
    },
    templateUrl: '/components/owner/taskers/current-taskers/current-taskers.html',
    controller: 'CurrentTaskersCtrl as currentTaskers'
  })
});
