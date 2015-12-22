angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('jobApplications', {
    url: '/applications?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: '/components/tasker/applications/job-applications.html',
    controller: 'JobApplicationsCtrl as applications'
  })
});
