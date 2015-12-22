// invite/invite.conf.js
angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('invite', {
    url: '/invite?tasker',
    params: {
      alert: undefined
    },
    templateUrl: 'components/owner/invite/invite.html',
    controller: 'InviteCtrl as invite'
  });
});
