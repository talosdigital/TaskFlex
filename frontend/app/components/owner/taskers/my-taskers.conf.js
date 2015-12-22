angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myTaskers', {
    templateUrl: '/components/owner/taskers/my-taskers.html'
  });
});
