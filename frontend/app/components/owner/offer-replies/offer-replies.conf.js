angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('offerReplies', {
    url: '/offer-replies?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: 'components/owner/offer-replies/offer-replies.html',
    controller: 'OfferRepliesCtrl as offerReplies'
  })
});
