angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myJobs.availableJobs', {
    url: '/jobs/available?category&filter&page',
    params: {
      alert: undefined,
      page: '1',
      category: '',
      filter: ''
    },
    templateUrl: 'components/tasker/jobs/available-jobs/available-jobs.html',
    controller: 'AvailableJobsCtrl as availableJobs'
  });
});
