angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myOffers.pastOffers', {
    url: '/offers/past?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: '/components/owner/offers/past-offers/past-offers.html',
    controller: 'PastOffersCtrl as pastOffers'
  })
});
