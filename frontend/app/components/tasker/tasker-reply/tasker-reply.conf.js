angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('taskerReply', {
    url: '/tasker-reply?offer&invitation&accepting',
    params: {
      alert: undefined,
      offer: undefined,
      invitation: undefined,
      accepting: undefined
    },
    templateUrl: '/components/tasker/tasker-reply/tasker-reply.html',
    controller: 'TaskerReplyCtrl as taskerReply'
  })
});
