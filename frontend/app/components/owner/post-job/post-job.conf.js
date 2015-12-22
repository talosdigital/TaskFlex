angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('postJob', {
    url: '/job/post?edit',
    params: {
      alert: undefined,
      newJob: undefined,
      edit: undefined
    },
    templateUrl: '/components/owner/post-job/post-job.html',
    controller: 'PostJobCtrl as postJob'
  })
});
