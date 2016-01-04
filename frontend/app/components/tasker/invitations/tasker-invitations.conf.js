angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('taskerInvitations', {
    url: '/invitations?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: 'components/tasker/invitations/tasker-invitations.html',
    controller: 'TaskerInvitationsCtrl as invitations'
  })
});
