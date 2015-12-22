angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('role-choice', {
    url: '/role-choice',
    templateUrl: '/components/role-choice/role-choice.html',
    controller: 'RoleChoiceCtrl as roleChoice'
  })
});
