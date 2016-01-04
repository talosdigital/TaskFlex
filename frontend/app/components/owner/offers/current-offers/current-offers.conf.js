angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myOffers.currentOffers', {
    url: '/offers/current?page',
    params: {
      alert: undefined,
      page: '1'
    },
    templateUrl: 'components/owner/offers/current-offers/current-offers.html',
    controller: 'CurrentOffersCtrl as currentOffers'
  })
});
