angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('jobDetails', {
    url: '/job-details?job',
    params: {
      alert: undefined,
      job: undefined
    },
    templateUrl: '/components/job-details/job-details.html',
    controller: 'JobDetailsCtrl as jobDetails'
  })
});
