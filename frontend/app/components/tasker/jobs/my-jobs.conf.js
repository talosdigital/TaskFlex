angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myJobs', {
    templateUrl: 'components/tasker/jobs/my-jobs.html'
  });
});
