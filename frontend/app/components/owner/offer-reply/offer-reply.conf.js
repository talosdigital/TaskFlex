angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('offerReply', {
    url: '/offer-reply?offer',
    params: {
      alert: undefined,
      offer: undefined
    },
    templateUrl: '/components/owner/offer-reply/offer-reply.html',
    controller: 'ReplyOfferCtrl as replyOffer'
  })
});
