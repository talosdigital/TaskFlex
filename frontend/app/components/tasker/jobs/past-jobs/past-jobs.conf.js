angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myJobs.pastJobs', {
    url: '/jobs/past?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: '/components/tasker/jobs/past-jobs/past-jobs.html',
    controller: 'PastJobsCtrl as pastJobs'
  })
});
