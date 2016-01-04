angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myJobs.currentJobs', {
    url: '/jobs/current?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: 'components/tasker/jobs/current-jobs/current-jobs.html',
    controller: 'CurrentJobsCtrl as currentJobs'
  })
});
