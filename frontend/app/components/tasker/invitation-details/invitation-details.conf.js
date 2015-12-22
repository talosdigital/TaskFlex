angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('invitationDetails', {
    url: '/invitation-details?id',
    params: {
      alert: undefined,
      id: undefined
    },
    templateUrl: '/components/tasker/invitation-details/invitation-details.html',
    controller: 'InvitationDetailsCtrl as details'
  })
});
