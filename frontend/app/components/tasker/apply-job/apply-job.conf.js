angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('applyJob', {
    url: '/apply-job?id',
    params: {
      alert: undefined,
      id: undefined
    },
    templateUrl: 'components/tasker/apply-job/apply-job.html',
    controller: 'ApplyJobCtrl as applyJob'
  })
});
