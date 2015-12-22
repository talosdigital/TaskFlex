angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('editProfile', {
    url: '/profile/edit',
    params: {
      alert: undefined
    },
    templateUrl: '/components/tasker/edit-profile/edit-profile.html',
    controller: 'EditProfileCtrl as edit'
  })
});
