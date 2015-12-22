angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('myOffers', {
    templateUrl: '/components/owner/offers/my-offers.html'
  });
});
