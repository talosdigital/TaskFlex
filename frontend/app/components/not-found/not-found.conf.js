angular.module('tf-client')
.config(function($stateProvider) {
  $stateProvider.state('notFound', {
    url: '/not-found',
    templateUrl: '/components/not-found/not-found.html',
    controller: 'NotFoundCtrl as notFound'
  })
});
