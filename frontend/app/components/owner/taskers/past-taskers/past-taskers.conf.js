angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myTaskers.pastTaskers', {
    url: '/taskers/past?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: 'components/owner/taskers/past-taskers/past-taskers.html',
    controller: 'PastTaskersCtrl as pastTaskers'
  })
});
